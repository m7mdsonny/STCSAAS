import httpx
import asyncio
from typing import Optional, Tuple, Dict, Any, List
from datetime import datetime
from loguru import logger

from config.settings import settings


class CloudDatabase:
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
        self.connected = False
        self._headers = {}
        self._retry_count = 3
        self._retry_delay = 2

    async def connect(self) -> bool:
        if not settings.CLOUD_API_URL:
            logger.warning("CLOUD_API_URL not configured")
            return False

        try:
            self._headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            if settings.CLOUD_API_KEY:
                self._headers["Authorization"] = f"Bearer {settings.CLOUD_API_KEY}"

            self.client = httpx.AsyncClient(
                base_url=settings.CLOUD_API_URL.rstrip('/'),
                headers=self._headers,
                timeout=30.0
            )

            response = await self.client.get("/api/v1/edge/health")
            self.connected = response.status_code in (200, 404, 401)
            return self.connected

        except Exception as e:
            logger.error(f"Connection failed: {e}")
            return False

    async def disconnect(self):
        if self.client:
            await self.client.aclose()
            self.client = None
        self.connected = False

    async def _request(self, method: str, endpoint: str, retry: bool = True, **kwargs) -> Tuple[bool, Any]:
        if not self.client:
            return False, "Not connected"

        attempts = self._retry_count if retry else 1
        last_error = None

        for attempt in range(attempts):
            try:
                response = await self.client.request(method, endpoint, **kwargs)

                if response.status_code in (200, 201):
                    data = response.json() if response.text else None
                    return True, data
                elif response.status_code == 401:
                    logger.error("Authentication failed - invalid API key")
                    return False, "Unauthorized"
                elif response.status_code == 403:
                    logger.error("Access forbidden - check permissions")
                    return False, "Forbidden"
                elif response.status_code == 422:
                    error_data = response.json() if response.text else {}
                    return False, error_data.get('message', 'Validation error')
                else:
                    last_error = f"Error {response.status_code}: {response.text}"

            except httpx.ConnectError as e:
                last_error = f"Connection error: {e}"
            except httpx.TimeoutException as e:
                last_error = f"Timeout: {e}"
            except Exception as e:
                last_error = str(e)

            if attempt < attempts - 1:
                await asyncio.sleep(self._retry_delay * (attempt + 1))

        logger.error(f"Request failed after {attempts} attempts: {last_error}")
        return False, last_error

    async def validate_license(self, license_key: str, hardware_id: Optional[str] = None) -> Tuple[bool, Dict]:
        payload = {
            "license_key": license_key,
            "hardware_id": hardware_id
        }

        success, data = await self._request(
            "POST",
            "/api/v1/edge/validate-license",
            json=payload
        )

        if success and data:
            return True, data

        return False, {}

    async def register_server(
        self,
        license_id: str,
        organization_id: str,
        name: str,
        version: str,
        hardware_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        server_data = {
            "license_id": license_id,
            "organization_id": organization_id,
            "name": name,
            "version": version,
            "hardware_id": hardware_id,
            "ip_address": self._get_local_ip(),
        }

        success, result = await self._request(
            "POST",
            "/api/v1/edge/register",
            json=server_data,
        )

        if success and result:
            return True, result.get("id") or result.get("edge_server_id")

        return False, None

    async def heartbeat(self, server_id: str, version: Optional[str] = None, system_info: Optional[Dict] = None) -> bool:
        payload = {
            "status": "online",
            "version": version,
            "system_info": system_info or self._get_system_info(),
        }

        success, _ = await self._request(
            "POST",
            f"/api/v1/edge/{server_id}/heartbeat",
            json=payload,
            retry=False
        )
        return success

    async def get_config(self, server_id: str) -> Dict:
        success, data = await self._request(
            "GET",
            f"/api/v1/edge/{server_id}/config"
        )
        return data if success and data else {}

    async def sync_all(self, server_id: str) -> Dict:
        success, data = await self._request(
            "GET",
            f"/api/v1/edge/{server_id}/sync"
        )

        if success and data:
            return {
                "cameras": data.get("cameras", []),
                "faces": data.get("registered_faces", []),
                "vehicles": data.get("registered_vehicles", []),
                "rules": data.get("automation_rules", []),
                "integrations": data.get("integrations", []),
            }

        return {}

    async def get_cameras(self, organization_id: str) -> List[Dict]:
        success, data = await self._request(
            "GET",
            "/api/v1/edge/cameras",
            params={"organization_id": organization_id}
        )
        return data.get("data", []) if success and isinstance(data, dict) else (data if success else [])

    async def get_registered_faces(self, organization_id: str) -> List[Dict]:
        success, data = await self._request(
            "GET",
            "/api/v1/edge/faces",
            params={"organization_id": organization_id}
        )
        return data.get("data", []) if success and isinstance(data, dict) else (data if success else [])

    async def get_registered_vehicles(self, organization_id: str) -> List[Dict]:
        success, data = await self._request(
            "GET",
            "/api/v1/edge/vehicles",
            params={"organization_id": organization_id}
        )
        return data.get("data", []) if success and isinstance(data, dict) else (data if success else [])

    async def get_automation_rules(self, organization_id: str) -> List[Dict]:
        success, data = await self._request(
            "GET",
            "/api/v1/edge/automation-rules",
            params={"organization_id": organization_id}
        )
        return data.get("data", []) if success and isinstance(data, dict) else (data if success else [])

    async def create_alert(self, alert_data: Dict) -> Tuple[bool, Optional[str]]:
        payload = {
            **alert_data,
            "occurred_at": alert_data.get('occurred_at') or datetime.utcnow().isoformat(),
        }

        success, result = await self._request(
            "POST",
            "/api/v1/edge/alerts",
            json=payload
        )

        if success and result:
            return True, result.get('id') or result.get('alert_id')

        return False, None

    async def create_event(self, event_data: Dict) -> bool:
        payload = {
            **event_data,
            "occurred_at": event_data.get('occurred_at') or datetime.utcnow().isoformat(),
        }

        success, _ = await self._request(
            "POST",
            "/api/v1/edge/events",
            json=payload
        )
        return success

    async def batch_events(self, events: List[Dict]) -> bool:
        if not events:
            return True

        payload = {
            "events": events,
            "submitted_at": datetime.utcnow().isoformat(),
        }

        success, _ = await self._request(
            "POST",
            "/api/v1/edge/events/batch",
            json=payload
        )
        return success

    async def fetch_pending_commands(self, edge_id: str) -> List[Dict]:
        success, data = await self._request(
            "GET",
            f"/api/v1/edge/{edge_id}/commands",
            params={"status": "pending"}
        )
        return data.get("data", []) if success and isinstance(data, dict) else (data if success else [])

    async def acknowledge_command(
        self,
        edge_id: str,
        command_id: int,
        status: str = "acknowledged",
        result: Optional[Dict] = None
    ) -> bool:
        payload = {
            "status": status,
            "result": result or {},
            "executed_at": datetime.utcnow().isoformat()
        }

        success, _ = await self._request(
            "POST",
            f"/api/v1/edge/{edge_id}/commands/{command_id}/ack",
            json=payload,
        )
        return success

    async def log_attendance(self, attendance_data: Dict) -> bool:
        payload = {
            **attendance_data,
            "occurred_at": attendance_data.get('occurred_at') or datetime.utcnow().isoformat()
        }

        success, _ = await self._request(
            "POST",
            "/api/v1/edge/attendance",
            json=payload
        )
        return success

    async def log_vehicle_access(self, access_data: Dict) -> bool:
        payload = {
            **access_data,
            "occurred_at": access_data.get('occurred_at') or datetime.utcnow().isoformat()
        }

        success, _ = await self._request(
            "POST",
            "/api/v1/edge/vehicle-access",
            json=payload
        )
        return success

    async def submit_analytics(self, analytics_data: Dict) -> bool:
        payload = {
            **analytics_data,
            "submitted_at": datetime.utcnow().isoformat()
        }

        success, _ = await self._request(
            "POST",
            "/api/v1/edge/analytics",
            json=payload
        )
        return success

    async def check_module_entitlement(self, license_id: str, module: str) -> bool:
        success, data = await self._request(
            "GET",
            f"/api/v1/edge/entitlement/{module}",
            params={"license_id": license_id}
        )
        return success and data.get("entitled", False) if data else False

    def _get_local_ip(self) -> Optional[str]:
        import socket
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            return None

    def _get_system_info(self) -> Dict:
        import platform
        try:
            import psutil
            return {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "processor": platform.processor(),
                "cpu_count": psutil.cpu_count(),
                "cpu_percent": psutil.cpu_percent(),
                "memory_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                "memory_used_percent": psutil.virtual_memory().percent,
                "disk_total_gb": round(psutil.disk_usage('/').total / (1024**3), 2),
                "disk_used_percent": psutil.disk_usage('/').percent,
            }
        except ImportError:
            return {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "processor": platform.processor(),
            }
