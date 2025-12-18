import asyncio
import os
import platform
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))
os.chdir(BASE_DIR)

from config.settings import settings
from app.core.license import LocalLicenseStore

settings.ensure_directories()

logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
    level=settings.LOG_LEVEL,
    colorize=True
)

try:
    logger.add(
        settings.log_file,
        rotation="10 MB",
        retention="7 days",
        level=settings.LOG_LEVEL,
        encoding="utf-8"
    )
except Exception as e:
    logger.warning(f"Could not setup file logging: {e}")


class EdgeServerState:
    def __init__(self):
        self.db = None
        self.server_id = None
        self.license_data = None
        self.is_licensed = False
        self.is_connected = False
        self.hardware_id = platform.node()
        self.cameras = {}
        self.modules_loaded = False


state = EdgeServerState()


async def initialize_database():
    from app.core.database import CloudDatabase
    state.db = CloudDatabase()

    if not settings.is_configured():
        logger.warning("Server not configured - visit /setup to configure")
        return False

    connected = await state.db.connect()
    state.is_connected = connected

    if not connected:
        logger.warning("Could not connect to cloud - running offline")
        return False

    logger.info("Connected to cloud control plane")
    return True


async def validate_license():
    license_store = LocalLicenseStore()

    if not settings.has_license():
        logger.warning("No license key configured")
        return False

    if not state.db:
        if license_store.is_within_grace(settings.LICENSE_KEY, state.hardware_id):
            state.license_data = license_store.data
            state.is_licensed = True
            logger.info("Using cached license within grace period (offline)")
            return True
        return False

    valid, license_data = await state.db.validate_license(settings.LICENSE_KEY, hardware_id=state.hardware_id)

    if valid:
        state.is_licensed = True
        state.license_data = license_data
        license_store.update_from_cloud(settings.LICENSE_KEY, license_data, state.hardware_id)
        logger.info(
            "License valid - expires at {} (grace {} days)",
            license_data.get('expires_at'),
            license_data.get('grace_days', 14),
        )
        return True

    if license_store.is_within_grace(settings.LICENSE_KEY, state.hardware_id):
        state.is_licensed = True
        state.license_data = license_store.data
        logger.warning("License validation failed online; using cached license within grace period")
        return True

    logger.warning("Invalid or expired license beyond grace period")
    return False


async def register_server():
    if not state.db or not state.is_licensed:
        return False

    import socket
    hostname = socket.gethostname()

    success, server_id = await state.db.register_server(
        license_id=state.license_data.get('license_id'),
        organization_id=state.license_data.get('organization_id'),
        name=hostname,
        version=settings.APP_VERSION,
        hardware_id=state.hardware_id,
    )

    if success:
        state.server_id = server_id
        logger.info(f"Server registered: {server_id}")
        return True

    return False


async def start_services():
    from app.services.sync import SyncService
    from app.services.camera import CameraService

    sync_service = SyncService(state.db)
    camera_service = CameraService()

    asyncio.create_task(sync_service.run())

    logger.info("Services started")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 60)
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("=" * 60)

    connected = await initialize_database()

    licensed = await validate_license()

    if licensed and connected:
        registered = await register_server()

        if registered:
            await start_services()
            logger.info("Server is FULLY OPERATIONAL")
        else:
            logger.warning("Server registration failed")
    elif licensed and not connected:
        await start_services()
        logger.warning("Running OFFLINE using cached license - cloud features paused")
    else:
        logger.warning("Running in SETUP MODE - visit /setup")

    logger.info("=" * 60)
    logger.info(f"API: http://{settings.SERVER_HOST}:{settings.SERVER_PORT}")
    logger.info(f"Setup: http://{settings.SERVER_HOST}:{settings.SERVER_PORT}/setup")
    logger.info("=" * 60)

    yield

    logger.info("Shutting down...")
    if state.db:
        await state.db.disconnect()
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import routes, setup
app.include_router(setup.router)
app.include_router(routes.router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "connected": state.is_connected,
        "licensed": state.is_licensed,
        "server_id": state.server_id
    }


@app.get("/health")
async def health():
    return {
        "healthy": state.is_connected and state.is_licensed,
        "connected": state.is_connected,
        "licensed": state.is_licensed,
        "server_id": state.server_id
    }


def main():
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
        log_level="warning"
    )


if __name__ == "__main__":
    if platform.system() == "Windows" and len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd in ("install", "remove", "start", "stop"):
            try:
                from app.service.windows import handle_service_command
                handle_service_command(cmd)
            except ImportError as e:
                print(f"Error: {e}")
                print("Install pywin32: pip install pywin32")
                sys.exit(1)
        else:
            main()
    else:
        main()
