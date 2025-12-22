"""
Cloud Database Communication Module
Handles all communication with the Cloud Laravel API
"""
import httpx
import asyncio
from typing import Optional, Tuple, Dict, Any, List
from datetime import datetime
from loguru import logger

from config.settings import settings


class CloudDatabase:
    """Manages communication with the Cloud Laravel API"""
    
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
        self.connected = False
        self._headers = {}
        self._retry_count = 3
        self._retry_delay = 2

    async def connect(self) -> bool:
        """Establish connection to Cloud API"""
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

            # Test connection
            response = await self.client.get("/api/v1/public/landing")
            self.connected = response.status_code in (200, 404, 401)
            
            if self.connected:
                logger.info(f"Connected to Cloud API: {settings.CLOUD_API_URL}")
            else:
                logger.warning(f"Cloud API connection test returned: {response.status_code}")
            
            return self.connected

        except Exception as e:
            logger.error(f"Connection failed: {e}")
            return False

    async def disconnect(self):
        """Close connection to Cloud API"""
        if self.client:
            await self.client.aclose()
            self.client = None
        self.connected = False

    async def _request(
        self, 
        method: str, 
        endpoint: str, 
        retry: bool = True, 
        **kwargs
    ) -> Tuple[bool, Any]:
        """Make HTTP request with retry logic"""
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
                    last_error = f"Error {response.status_code}: {response.text[:200]}"

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

    async def validate_license(
        self, 
        license_key: str, 
        hardware_id: Optional[str] = None
    ) -> Tuple[bool, Dict]:
        """
        Validate license key with Cloud API
        
        Expected Cloud API endpoint: POST /api/v1/licensing/validate
        Expected request: { license_key: str, edge_id: str }
        Expected response: { valid: bool, organization_id: int, expires_at: str, grace_days: int }
        """
        from main import state
        
        edge_id = state.hardware_id if not hasattr(state, 'edge_id') or not state.edge_id else state.edge_id
        
        payload = {
            "license_key": license_key,
            "edge_id": edge_id or hardware_id or "unknown"
        }

        success, data = await self._request(
            "POST",
            "/api/v1/licensing/validate",
            json=payload
        )

        if success and data and data.get('valid'):
            # Map Cloud response to Edge Server format
            return True, {
                'license_id': data.get('license_id'),
                'organization_id': data.get('organization_id'),
                'expires_at': data.get('expires_at'),
                'grace_days': data.get('grace_days', 14),
                'plan': data.get('plan', 'trial'),
                'max_cameras': data.get('max_cameras', 4),
                'modules': data.get('modules', []),
            }

        return False, {}

    async def heartbeat(
        self, 
        edge_id: str, 
        version: Optional[str] = None, 
        system_info: Optional[Dict] = None,
        organization_id: Optional[int] = None,
        license_id: Optional[int] = None
    ) -> bool:
        """
        Send heartbeat to Cloud API
        
        Expected Cloud API endpoint: POST /api/v1/edges/heartbeat
        Expected request: { edge_id, version, online, organization_id, license_id }
        """
        from main import state
        
        payload = {
            "edge_id": edge_id,
            "version": version or settings.APP_VERSION,
            "online": True,
            "organization_id": organization_id or (state.license_data.get('organization_id') if state.license_data else None),
            "license_id": license_id or (state.license_data.get('license_id') if state.license_data else None),
        }

        if system_info:
            payload['system_info'] = system_info

        success, _ = await self._request(
            "POST",
            "/api/v1/edges/heartbeat",
            json=payload,
            retry=False
        )
        return success

    async def register_server(
        self,
        license_id: str,
        organization_id: str,
        name: str,
        version: str,
        hardware_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Register Edge Server with Cloud (via heartbeat, not separate endpoint)
        Cloud uses heartbeat to auto-register Edge Servers
        """
        # Registration happens via heartbeat, so we just return success
        # The Cloud will create/update the Edge Server record on heartbeat
        return True, hardware_id

    async def get_config(self, server_id: str) -> Dict:
        """Get configuration from Cloud (not currently used)"""
        return {}

    async def sync_all(self, server_id: str) -> Dict:
        """
        Sync all configuration from Cloud
        
        Expected Cloud API endpoints:
        - GET /api/v1/cameras?organization_id=X
        - GET /api/v1/edge/faces?organization_id=X (if exists)
        - GET /api/v1/edge/vehicles?organization_id=X (if exists)
        """
        from main import state
        
        if not state.license_data:
            return {}

        org_id = state.license_data.get('organization_id')
        if not org_id:
            return {}

        result = {
            "cameras": [],
            "faces": [],
            "vehicles": [],
            "rules": [],
            "integrations": [],
        }

        # Get cameras
        cameras = await self.get_cameras(org_id)
        result["cameras"] = cameras

        # Get registered faces (if endpoint exists)
        faces = await self.get_registered_faces(org_id)
        result["faces"] = faces

        # Get registered vehicles (if endpoint exists)
        vehicles = await self.get_registered_vehicles(org_id)
        result["vehicles"] = vehicles

        # Get automation rules
        rules = await self.get_automation_rules(org_id)
        result["rules"] = rules

        return result

    async def get_cameras(self, organization_id: str) -> List[Dict]:
        """Get cameras for organization"""
        success, data = await self._request(
            "GET",
            "/api/v1/cameras",
            params={"organization_id": organization_id}
        )
        
        if success and isinstance(data, dict):
            # Handle paginated response
            if 'data' in data:
                return data['data']
            return data if isinstance(data, list) else []
        return []

    async def get_registered_faces(self, organization_id: str) -> List[Dict]:
        """Get registered faces (placeholder - implement when Cloud API is ready)"""
        # TODO: Implement when Cloud API endpoint is available
        return []

    async def get_registered_vehicles(self, organization_id: str) -> List[Dict]:
        """Get registered vehicles (placeholder - implement when Cloud API is ready)"""
        # TODO: Implement when Cloud API endpoint is available
        return []

    async def get_automation_rules(self, organization_id: str) -> List[Dict]:
        """Get automation rules (placeholder - implement when Cloud API is ready)"""
        # TODO: Implement when Cloud API endpoint is available
        return []

    async def create_alert(self, alert_data: Dict) -> Tuple[bool, Optional[str]]:
        """
        Create alert in Cloud
        
        Expected Cloud API endpoint: POST /api/v1/edges/events
        """
        payload = {
            **alert_data,
            "occurred_at": alert_data.get('occurred_at') or datetime.utcnow().isoformat(),
        }

        success, result = await self._request(
            "POST",
            "/api/v1/edges/events",
            json=payload
        )

        if success and result:
            return True, result.get('id') or result.get('alert_id')

        return False, None

    async def create_event(self, event_data: Dict) -> bool:
        """Create event in Cloud (same as alert)"""
        return (await self.create_alert(event_data))[0]

    async def batch_events(self, events: List[Dict]) -> bool:
        """Batch create events"""
        if not events:
            return True

        # Send events one by one (Cloud may support batch endpoint later)
        success_count = 0
        for event in events:
            success = await self.create_event(event)
            if success:
                success_count += 1

        return success_count > 0

    async def fetch_pending_commands(self, edge_id: str) -> List[Dict]:
        """
        Fetch pending AI commands from Cloud
        
        Expected Cloud API endpoint: GET /api/v1/ai-commands?edge_server_id=X&status=pending
        """
        from main import state
        
        # Get edge server ID from Cloud
        # For now, we'll use a different approach - Cloud will push commands
        # But we can poll if needed
        return []

    async def acknowledge_command(
        self,
        edge_id: str,
        command_id: int,
        status: str = "acknowledged",
        result: Optional[Dict] = None
    ) -> bool:
        """
        Acknowledge AI command execution
        
        Expected Cloud API endpoint: POST /api/v1/ai-commands/{id}/ack
        """
        payload = {
            "status": status,
            "result": result or {},
            "executed_at": datetime.utcnow().isoformat()
        }

        success, _ = await self._request(
            "POST",
            f"/api/v1/ai-commands/{command_id}/ack",
            json=payload,
        )
        return success

    async def log_attendance(self, attendance_data: Dict) -> bool:
        """Log attendance (via events endpoint)"""
        return await self.create_event({
            **attendance_data,
            "type": "attendance"
        })

    async def log_vehicle_access(self, access_data: Dict) -> bool:
        """Log vehicle access (via events endpoint)"""
        return await self.create_event({
            **access_data,
            "type": "vehicle_access"
        })

    async def submit_analytics(self, analytics_data: Dict) -> bool:
        """Submit analytics (via events endpoint)"""
        return await self.create_event({
            **analytics_data,
            "type": "analytics"
        })

    async def check_module_entitlement(self, license_id: str, module: str) -> bool:
        """Check if module is enabled for license"""
        from main import state
        
        if state.license_data:
            modules = state.license_data.get('modules', [])
            return module in modules
        
        return False

    def _get_local_ip(self) -> Optional[str]:
        """Get local IP address"""
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
        """Get system information"""
        import platform
        try:
            import psutil
            return {
                "platform": platform.system(),
                "platform_version": platform.version(),
                "processor": platform.processor(),
                "cpu_count": psutil.cpu_count(),
                "cpu_percent": psutil.cpu_percent(interval=0.1),
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
