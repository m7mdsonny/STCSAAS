from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

from config.settings import settings

router = APIRouter(tags=["API"])


class CameraConfig(BaseModel):
    id: str
    name: str
    rtsp_url: str
    enabled_modules: List[str] = []


class AlertCreate(BaseModel):
    camera_id: str
    module: str
    type: str
    severity: str
    title: str
    description: Optional[str] = None
    metadata: Optional[Dict] = None


@router.get("/status")
async def get_status(request: Request):
    from main import state

    return {
        "server": {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "uptime": "running"
        },
        "connection": {
            "cloud": state.is_connected,
            "licensed": state.is_licensed
        },
        "license": {
            "valid": state.is_licensed,
            "plan": state.license_data.get('plan') if state.license_data else None,
            "max_cameras": state.license_data.get('max_cameras') if state.license_data else 0,
            "modules": state.license_data.get('modules') if state.license_data else []
        },
        "cameras": {
            "active": len(state.cameras),
            "max": settings.MAX_CAMERAS
        }
    }


@router.get("/cameras")
async def list_cameras(request: Request):
    from main import state

    if not state.db or not state.is_licensed:
        raise HTTPException(status_code=503, detail="Server not ready")

    org_id = state.license_data.get('organization_id')
    if not org_id:
        return []

    cameras = await state.db.get_cameras(org_id)
    return cameras


@router.post("/cameras")
async def add_camera(camera: CameraConfig, request: Request):
    from main import state

    if len(state.cameras) >= settings.MAX_CAMERAS:
        raise HTTPException(status_code=400, detail="Maximum cameras reached")

    state.cameras[camera.id] = camera.dict()
    return {"success": True, "camera_id": camera.id}


@router.delete("/cameras/{camera_id}")
async def remove_camera(camera_id: str, request: Request):
    from main import state

    if camera_id not in state.cameras:
        raise HTTPException(status_code=404, detail="Camera not found")

    del state.cameras[camera_id]
    return {"success": True}


@router.get("/alerts")
async def list_alerts(request: Request, limit: int = 50):
    from main import state

    if not state.db or not state.is_licensed:
        raise HTTPException(status_code=503, detail="Server not ready")

    return {"alerts": [], "total": 0}


@router.post("/alerts")
async def create_alert(alert: AlertCreate, request: Request):
    from main import state

    if not state.db or not state.is_licensed:
        raise HTTPException(status_code=503, detail="Server not ready")

    org_id = state.license_data.get('organization_id')

    alert_data = {
        "organization_id": org_id,
        "edge_server_id": state.server_id,
        "camera_id": alert.camera_id,
        "module": alert.module,
        "type": alert.type,
        "severity": alert.severity,
        "title": alert.title,
        "description": alert.description,
        "metadata": alert.metadata or {},
        "status": "new"
    }

    success, alert_id = await state.db.create_alert(alert_data)

    if success:
        return {"success": True, "alert_id": alert_id}

    raise HTTPException(status_code=500, detail="Failed to create alert")


@router.get("/modules")
async def list_modules(request: Request):
    from main import state

    available_modules = [
        {"id": "face", "name": "Face Recognition", "description": "Detect and recognize faces"},
        {"id": "counter", "name": "People Counter", "description": "Count people entering/exiting"},
        {"id": "fire", "name": "Fire Detection", "description": "Detect fire and smoke"},
        {"id": "intrusion", "name": "Intrusion Detection", "description": "Detect unauthorized access"},
        {"id": "vehicle", "name": "Vehicle Recognition", "description": "Read license plates"},
        {"id": "attendance", "name": "Attendance", "description": "Track employee attendance"}
    ]

    licensed_modules = []
    if state.license_data:
        licensed_modules = state.license_data.get('modules', [])

    for module in available_modules:
        module['enabled'] = module['id'] in licensed_modules

    return available_modules


@router.get("/automation")
async def list_automation(request: Request):
    from main import state

    if not state.db or not state.is_licensed:
        return []

    org_id = state.license_data.get('organization_id')
    if not org_id:
        return []

    rules = await state.db.get_automation_rules(org_id)
    return rules


@router.get("/system/info")
async def system_info():
    import platform
    import psutil

    return {
        "os": platform.system(),
        "os_version": platform.release(),
        "python": platform.python_version(),
        "cpu_count": psutil.cpu_count(),
        "cpu_percent": psutil.cpu_percent(),
        "memory_total": psutil.virtual_memory().total,
        "memory_used": psutil.virtual_memory().used,
        "memory_percent": psutil.virtual_memory().percent,
        "disk_total": psutil.disk_usage('/').total,
        "disk_used": psutil.disk_usage('/').used,
        "disk_percent": psutil.disk_usage('/').percent
    }
