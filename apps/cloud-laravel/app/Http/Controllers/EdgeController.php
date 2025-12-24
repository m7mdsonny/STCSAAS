<?php

namespace App\Http\Controllers;

use App\Helpers\RoleHelper;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\EdgeServer;
use App\Models\EdgeServerLog;
use App\Models\License;
use Illuminate\Support\Str;

class EdgeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = EdgeServer::query();

        // Organization users can only see their org's edge servers
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            if ($user->organization_id) {
                $query->where('organization_id', $user->organization_id);
            } else {
                return response()->json(['data' => [], 'total' => 0]);
            }
        }

        // Super admin can filter by organization
        if ($request->filled('organization_id') && RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $query->where('organization_id', $request->get('organization_id'));
        }

        if ($request->filled('status')) {
            $query->where('online', $request->get('status') === 'online');
        }

        $perPage = (int) $request->get('per_page', 15);

        return response()->json($query->with(['organization', 'license'])->orderByDesc('last_seen_at')->paginate($perPage));
    }

    public function show(EdgeServer $edgeServer): JsonResponse
    {
        return response()->json($edgeServer);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Auto-set organization_id for non-super-admin users
        $organizationId = $user->organization_id;
        if (RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false) && $request->filled('organization_id')) {
            $organizationId = $request->get('organization_id');
        }
        
        if (!$organizationId) {
            return response()->json(['message' => 'Organization ID is required'], 422);
        }
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'organization_id' => 'sometimes|exists:organizations,id',
            'license_id' => 'nullable|exists:licenses,id',
            'edge_id' => 'nullable|string|unique:edge_servers,edge_id',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Override organization_id with auto-detected value
        $data['organization_id'] = $organizationId;

        // Organization users can only create edge servers for their organization
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            if (!$user->organization_id) {
                return response()->json(['message' => 'User must belong to an organization'], 403);
            }
            if ((int) $organizationId !== (int) $user->organization_id) {
                return response()->json(['message' => 'You can only create edge servers for your organization'], 403);
            }
            // Only owners and admins can create edge servers
            if (!RoleHelper::canManageOrganization($user->role)) {
                return response()->json(['message' => 'Insufficient permissions to create edge servers'], 403);
            }
        }

        // If license_id provided, verify it belongs to the organization
        if (!empty($data['license_id'])) {
            $license = \App\Models\License::findOrFail($data['license_id']);
            if ($license->organization_id !== (int) $organizationId) {
                return response()->json(['message' => 'License does not belong to the specified organization'], 403);
            }

            // Check if license is already bound to another edge server
            $existingEdge = EdgeServer::where('license_id', $data['license_id'])
                ->where('id', '!=', $request->get('edge_id')) // Exclude current if updating
                ->first();
            if ($existingEdge) {
                return response()->json(['message' => 'License is already bound to another edge server'], 409);
            }
        }

        $edgeServer = EdgeServer::create([
            ...$data,
            'edge_id' => $data['edge_id'] ?? Str::uuid()->toString(),
            'online' => false,
        ]);

        return response()->json($edgeServer->load(['organization', 'license']), 201);
    }

    public function update(Request $request, EdgeServer $edgeServer): JsonResponse
    {
        $user = $request->user();

        // Check ownership and permissions
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess($request, $edgeServer->organization_id);
            if (!RoleHelper::canManageOrganization($user->role)) {
                return response()->json(['message' => 'Insufficient permissions to update edge servers'], 403);
            }
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'license_id' => 'nullable|exists:licenses,id',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'online' => 'nullable|boolean',
            'system_info' => 'nullable|array',
            'version' => 'nullable|string',
        ]);

        // If license_id is being updated, verify ownership and uniqueness
        if (isset($data['license_id']) && $data['license_id'] !== $edgeServer->license_id) {
            $license = \App\Models\License::findOrFail($data['license_id']);
            
            // Verify license belongs to the edge server's organization
            if ($license->organization_id !== $edgeServer->organization_id) {
                return response()->json(['message' => 'License does not belong to this edge server\'s organization'], 403);
            }

            // Check if license is already bound to another edge server
            $existingEdge = EdgeServer::where('license_id', $data['license_id'])
                ->where('id', '!=', $edgeServer->id)
                ->first();
            if ($existingEdge) {
                return response()->json(['message' => 'License is already bound to another edge server'], 409);
            }
        }

        $edgeServer->update($data);

        return response()->json($edgeServer->load(['organization', 'license']));
    }

    public function destroy(EdgeServer $edgeServer): JsonResponse
    {
        $user = request()->user();

        // Check ownership and permissions
        if (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $this->ensureOrganizationAccess(request(), $edgeServer->organization_id);
            if (!RoleHelper::canManageOrganization($user->role)) {
                return response()->json(['message' => 'Insufficient permissions to delete edge servers'], 403);
            }
        }

        $edgeServer->delete();
        return response()->json(['message' => 'Edge server deleted']);
    }

    public function logs(Request $request, EdgeServer $edgeServer): JsonResponse
    {
        $query = EdgeServerLog::where('edge_server_id', $edgeServer->id);

        if ($request->filled('level')) {
            $query->where('level', $request->get('level'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate((int) $request->get('per_page', 15)));
    }

    public function restart(EdgeServer $edgeServer): JsonResponse
    {
        EdgeServerLog::create([
            'edge_server_id' => $edgeServer->id,
            'level' => 'info',
            'message' => 'Restart requested from control panel',
            'meta' => ['requested_at' => now()->toIso8601String()],
        ]);

        return response()->json(['message' => 'Restart signal queued']);
    }

    public function syncConfig(EdgeServer $edgeServer): JsonResponse
    {
        EdgeServerLog::create([
            'edge_server_id' => $edgeServer->id,
            'level' => 'info',
            'message' => 'Configuration sync requested',
            'meta' => ['requested_at' => now()->toIso8601String()],
        ]);

        return response()->json(['message' => 'Sync request recorded']);
    }

    public function config(EdgeServer $edgeServer): JsonResponse
    {
        return response()->json($edgeServer->system_info ?? []);
    }

    public function heartbeat(Request $request): JsonResponse
    {
        $request->validate([
            'edge_id' => 'required|string',
            'version' => 'required|string',
            'online' => 'required|boolean',
            'organization_id' => 'required|integer|exists:organizations,id',
            'license_id' => 'sometimes|integer|exists:licenses,id',
            'cameras_status' => 'nullable|array', // Array of {camera_id: string, status: 'online'|'offline'}
        ]);

        $existingEdge = EdgeServer::where('edge_id', $request->edge_id)->first();

        $organizationId = $request->get('organization_id', $existingEdge?->organization_id);

        if ($organizationId === null) {
            return response()->json([
                'message' => 'organization_id is required for new edge registrations',
            ], 422);
        }

        $edge = EdgeServer::updateOrCreate(
            ['edge_id' => $request->edge_id],
            [
                'organization_id' => $organizationId,
                'license_id' => $request->has('license_id') ? $request->get('license_id') : $existingEdge?->license_id,
                'version' => $request->version,
                'online' => $request->boolean('online'),
                'last_seen_at' => now(),
            ]
        );

        // Update camera statuses if provided
        if ($request->has('cameras_status') && is_array($request->cameras_status)) {
            foreach ($request->cameras_status as $cameraStatus) {
                if (isset($cameraStatus['camera_id']) && isset($cameraStatus['status'])) {
                    $camera = \App\Models\Camera::where('camera_id', $cameraStatus['camera_id'])
                        ->where('edge_server_id', $edge->id)
                        ->first();
                    
                    if ($camera) {
                        $oldStatus = $camera->status;
                        $camera->status = $cameraStatus['status'];
                        $camera->save();
                        
                        // CameraObserver will handle offline notification if status changed to offline
                    }
                }
            }
        }

        return response()->json(['ok' => true, 'edge' => $edge]);
    }
}
