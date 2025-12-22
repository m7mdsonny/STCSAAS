<?php

namespace App\Http\Controllers;

use App\Helpers\RoleHelper;
use App\Models\Camera;
use App\Models\EdgeServer;
use App\Services\EdgeServerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class CameraController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Camera::query();

        // Organization owners/admins can only see their org's cameras
        if ($user->organization_id) {
            $query->where('organization_id', $user->organization_id);
        }

        // Super admin can filter by organization
        if ($request->filled('organization_id') && RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $query->where('organization_id', $request->get('organization_id'));
        }

        if ($request->filled('edge_server_id')) {
            $query->where('edge_server_id', $request->get('edge_server_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('location', 'ILIKE', "%{$search}%")
                    ->orWhere('camera_id', 'ILIKE', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $cameras = $query->with(['organization', 'edgeServer'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        // Transform response to include config fields at top level for frontend compatibility
        $cameras->getCollection()->transform(function ($camera) {
            $config = $camera->config ?? [];
            $camera->username = $config['username'] ?? null;
            $camera->password_encrypted = isset($config['password']) ? '***' : null; // Don't expose password
            $camera->resolution = $config['resolution'] ?? '1920x1080';
            $camera->fps = $config['fps'] ?? 15;
            $camera->enabled_modules = $config['enabled_modules'] ?? [];
            return $camera;
        });

        return response()->json($cameras);
    }

    public function show(Camera $camera): JsonResponse
    {
        $user = request()->user();
        
        // Check ownership
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess(request(), $camera->organization_id);
        }

        $camera->load(['organization', 'edgeServer']);
        return response()->json($camera);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user->organization_id;

        // Super admin can specify organization
        if (RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false) && $request->filled('organization_id')) {
            $organizationId = $request->get('organization_id');
        }
        
        // Non-super-admin users must have organization and can only create for their org
        if (!$organizationId) {
            return response()->json(['message' => 'Organization ID is required'], 422);
        }
        
        // Check permissions - only editors and above can create cameras
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            if (!RoleHelper::canEdit($user->role)) {
                return response()->json(['message' => 'Insufficient permissions to create cameras'], 403);
            }
            $this->ensureOrganizationAccess($request, $organizationId);
        }

        if (!$organizationId) {
            return response()->json(['message' => 'Organization ID is required'], 422);
        }

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'edge_server_id' => 'required|exists:edge_servers,id',
            'rtsp_url' => 'required|string|max:500',
            'location' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'resolution' => 'nullable|string|max:50',
            'fps' => 'nullable|integer|min:1|max:60',
            'enabled_modules' => 'nullable|array',
            'status' => 'nullable|string|in:online,offline,error',
        ]);

        // Verify edge server belongs to organization
        $edgeServer = EdgeServer::findOrFail($data['edge_server_id']);
        if ($edgeServer->organization_id !== (int) $organizationId) {
            return response()->json(['message' => 'Edge server does not belong to your organization'], 403);
        }

        // Generate unique camera_id if not provided
        $cameraId = $request->get('camera_id', 'cam_' . Str::random(16));

        // Store sensitive and config data in config JSONB field
        $config = [
            'resolution' => $data['resolution'] ?? '1920x1080',
            'fps' => $data['fps'] ?? 15,
            'enabled_modules' => $data['enabled_modules'] ?? [],
        ];

        // Encrypt and store password if provided
        if (isset($data['password']) && $data['password']) {
            $config['password'] = Crypt::encryptString($data['password']);
        }

        if (isset($data['username'])) {
            $config['username'] = $data['username'];
        }

        $camera = Camera::create([
            'organization_id' => $organizationId,
            'edge_server_id' => $data['edge_server_id'],
            'name' => $data['name'],
            'camera_id' => $cameraId,
            'rtsp_url' => $data['rtsp_url'],
            'location' => $data['location'] ?? null,
            'status' => $data['status'] ?? 'offline',
            'config' => $config,
        ]);

        $camera->load(['organization', 'edgeServer']);

        // Sync camera configuration to Edge Server
        try {
            $edgeService = new EdgeServerService();
            $edgeService->syncCameraToEdge($camera);
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::warning("Failed to sync camera to Edge: {$e->getMessage()}");
        }

        return response()->json($camera, 201);
    }

    public function update(Request $request, Camera $camera): JsonResponse
    {
        $user = $request->user();

        // Check ownership and permissions
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess($request, $camera->organization_id);
            if (!RoleHelper::canEdit($user->role)) {
                return response()->json(['message' => 'Insufficient permissions to edit cameras'], 403);
            }
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'edge_server_id' => 'sometimes|exists:edge_servers,id',
            'rtsp_url' => 'sometimes|string|max:500',
            'location' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'resolution' => 'nullable|string|max:50',
            'fps' => 'nullable|integer|min:1|max:60',
            'enabled_modules' => 'nullable|array',
            'status' => 'nullable|string|in:online,offline,error',
        ]);

        // Verify edge server belongs to organization if changed
        if (isset($data['edge_server_id'])) {
            $edgeServer = EdgeServer::findOrFail($data['edge_server_id']);
            if ($edgeServer->organization_id !== $camera->organization_id) {
                return response()->json(['message' => 'Edge server does not belong to your organization'], 403);
            }
        }

        // Update config JSONB field
        $config = $camera->config ?? [];
        
        if (isset($data['resolution'])) {
            $config['resolution'] = $data['resolution'];
            unset($data['resolution']);
        }
        if (isset($data['fps'])) {
            $config['fps'] = $data['fps'];
            unset($data['fps']);
        }
        if (isset($data['enabled_modules'])) {
            $config['enabled_modules'] = $data['enabled_modules'];
            unset($data['enabled_modules']);
        }
        if (isset($data['username'])) {
            $config['username'] = $data['username'];
            unset($data['username']);
        }
        if (isset($data['password']) && $data['password']) {
            $config['password'] = Crypt::encryptString($data['password']);
            unset($data['password']);
        }

        $data['config'] = $config;

        $camera->update($data);
        $camera->load(['organization', 'edgeServer']);

        // Sync updated camera configuration to Edge Server
        try {
            $edgeService = new EdgeServerService();
            $edgeService->syncCameraToEdge($camera);
        } catch (\Exception $e) {
            \Log::warning("Failed to sync camera update to Edge: {$e->getMessage()}");
        }

        return response()->json($camera);
    }

    public function destroy(Camera $camera): JsonResponse
    {
        $user = request()->user();

        // Check ownership and permissions
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess(request(), $camera->organization_id);
            if (!RoleHelper::canManageOrganization($user->role)) {
                return response()->json(['message' => 'Insufficient permissions to delete cameras'], 403);
            }
        }

        // Remove camera from Edge Server before deleting
        try {
            $edgeService = new EdgeServerService();
            $edgeService->removeCameraFromEdge($camera);
        } catch (\Exception $e) {
            \Log::warning("Failed to remove camera from Edge: {$e->getMessage()}");
        }

        $camera->delete();

        return response()->json(['message' => 'Camera deleted']);
    }

    public function getSnapshot(Camera $camera): JsonResponse
    {
        $user = request()->user();

        // Check ownership
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess(request(), $camera->organization_id);
        }

        // Get snapshot from Edge Server
        try {
            $edgeService = new EdgeServerService();
            $snapshot = $edgeService->getCameraSnapshot($camera);
            
            if ($snapshot) {
                return response()->json($snapshot);
            }
        } catch (\Exception $e) {
            \Log::warning("Failed to get camera snapshot: {$e->getMessage()}");
        }

        // Return placeholder if Edge Server unavailable
        return response()->json([
            'image' => null,
            'timestamp' => now()->toIso8601String(),
            'camera_id' => $camera->camera_id,
            'error' => 'Edge Server unavailable',
        ]);
    }

    /**
     * Get HLS stream URL for camera
     */
    public function getStreamUrl(Camera $camera): JsonResponse
    {
        $user = request()->user();

        // Check ownership
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess(request(), $camera->organization_id);
        }

        $edgeService = new EdgeServerService();
        $hlsUrl = $edgeService->getHlsStreamUrl($camera);
        $webrtcEndpoint = $edgeService->getWebRtcEndpoint($camera);

        return response()->json([
            'hls_url' => $hlsUrl,
            'webrtc_endpoint' => $webrtcEndpoint,
            'camera_id' => $camera->camera_id,
        ]);
    }
}

