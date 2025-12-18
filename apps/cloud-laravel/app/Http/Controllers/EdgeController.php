<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\EdgeServer;
use App\Models\EdgeServerLog;
use Illuminate\Support\Str;

class EdgeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EdgeServer::query();

        if ($request->filled('status')) {
            $query->where('online', $request->get('status') === 'online');
        }

        $perPage = (int) $request->get('per_page', 15);

        return response()->json($query->orderByDesc('last_seen_at')->paginate($perPage));
    }

    public function show(EdgeServer $edgeServer): JsonResponse
    {
        return response()->json($edgeServer);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'organization_id' => 'required|exists:organizations,id',
            'license_id' => 'nullable|exists:licenses,id',
            'edge_id' => 'nullable|string|unique:edge_servers,edge_id',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $edgeServer = EdgeServer::create([
            ...$data,
            'edge_id' => $data['edge_id'] ?? Str::uuid()->toString(),
            'online' => false,
        ]);

        return response()->json($edgeServer, 201);
    }

    public function update(Request $request, EdgeServer $edgeServer): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'license_id' => 'nullable|exists:licenses,id',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'online' => 'nullable|boolean',
            'system_info' => 'nullable|array',
            'version' => 'nullable|string',
        ]);

        $edgeServer->update($data);

        return response()->json($edgeServer);
    }

    public function destroy(EdgeServer $edgeServer): JsonResponse
    {
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
        ]);

        $edge = EdgeServer::updateOrCreate(
            ['edge_id' => $request->edge_id],
            [
                'organization_id' => $request->get('organization_id'),
                'license_id' => $request->get('license_id'),
                'version' => $request->version,
                'online' => $request->boolean('online'),
                'last_seen_at' => now(),
            ]
        );

        return response()->json(['ok' => true, 'edge' => $edge]);
    }
}
