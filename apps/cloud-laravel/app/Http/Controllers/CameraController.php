<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CameraController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('cameras')
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('edge_server_id')) {
            $query->where('edge_server_id', $request->get('edge_server_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        $perPage = (int) $request->get('per_page', 15);
        $cameras = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($cameras);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $camera = DB::table('cameras')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$camera) {
            return response()->json(['message' => 'Camera not found'], 404);
        }

        return response()->json($camera);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'edge_server_id' => 'required|string|exists:edge_servers,id',
            'rtsp_url' => 'required|string',
            'location' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'resolution' => 'nullable|string',
            'fps' => 'nullable|integer|min:1|max:60',
            'enabled_modules' => 'nullable|array',
        ]);

        $cameraId = DB::table('cameras')->insertGetId([
            'organization_id' => $request->user()->organization_id,
            'edge_server_id' => $data['edge_server_id'],
            'name' => $data['name'],
            'camera_id' => uniqid('cam_'),
            'rtsp_url' => $data['rtsp_url'],
            'location' => $data['location'] ?? null,
            'status' => 'offline',
            'config' => json_encode([
                'username' => $data['username'] ?? null,
                'password' => $data['password'] ?? null,
                'resolution' => $data['resolution'] ?? '1920x1080',
                'fps' => $data['fps'] ?? 15,
                'enabled_modules' => $data['enabled_modules'] ?? [],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $camera = DB::table('cameras')->where('id', $cameraId)->first();
        return response()->json($camera, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $camera = DB::table('cameras')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$camera) {
            return response()->json(['message' => 'Camera not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'rtsp_url' => 'sometimes|string',
            'username' => 'nullable|string|max:255',
            'password' => 'nullable|string|max:255',
            'resolution' => 'nullable|string',
            'fps' => 'nullable|integer|min:1|max:60',
            'enabled_modules' => 'nullable|array',
        ]);

        $config = json_decode($camera->config ?? '{}', true);
        if (isset($data['username'])) $config['username'] = $data['username'];
        if (isset($data['password'])) $config['password'] = $data['password'];
        if (isset($data['resolution'])) $config['resolution'] = $data['resolution'];
        if (isset($data['fps'])) $config['fps'] = $data['fps'];
        if (isset($data['enabled_modules'])) $config['enabled_modules'] = $data['enabled_modules'];

        DB::table('cameras')
            ->where('id', $id)
            ->update([
                'name' => $data['name'] ?? $camera->name,
                'location' => $data['location'] ?? $camera->location,
                'rtsp_url' => $data['rtsp_url'] ?? $camera->rtsp_url,
                'config' => json_encode($config),
                'updated_at' => now(),
            ]);

        $updated = DB::table('cameras')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $camera = DB::table('cameras')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$camera) {
            return response()->json(['message' => 'Camera not found'], 404);
        }

        DB::table('cameras')->where('id', $id)->delete();
        return response()->json(['message' => 'Camera deleted']);
    }

    public function testConnection(Request $request): JsonResponse
    {
        $request->validate([
            'rtsp_url' => 'required|string',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
        ]);

        // TODO: Implement actual RTSP connection test
        return response()->json([
            'success' => true,
            'message' => 'Connection test not implemented yet',
        ]);
    }

    public function getSnapshot(Request $request, string $id): JsonResponse
    {
        $camera = DB::table('cameras')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$camera) {
            return response()->json(['message' => 'Camera not found'], 404);
        }

        // TODO: Get snapshot from edge server
        return response()->json([
            'snapshot_url' => null,
            'message' => 'Snapshot feature requires edge server integration',
        ]);
    }
}

