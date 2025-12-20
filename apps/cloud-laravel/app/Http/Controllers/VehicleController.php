<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('registered_vehicles')
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('plate_number', 'like', "%{$search}%")
                  ->orWhere('plate_ar', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $vehicles = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($vehicles);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $vehicle = DB::table('registered_vehicles')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$vehicle) {
            return response()->json(['message' => 'Vehicle not found'], 404);
        }

        return response()->json($vehicle);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plate_number' => 'required|string|max:255',
            'plate_ar' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'vehicle_type' => 'nullable|string|max:255',
            'vehicle_color' => 'nullable|string|max:255',
            'category' => 'required|string|in:authorized,visitor,blacklist,vip',
        ]);

        $vehicleId = DB::table('registered_vehicles')->insertGetId([
            'organization_id' => $request->user()->organization_id,
            'plate_number' => $data['plate_number'],
            'plate_ar' => $data['plate_ar'] ?? null,
            'owner_name' => $data['owner_name'] ?? null,
            'vehicle_type' => $data['vehicle_type'] ?? null,
            'vehicle_color' => $data['vehicle_color'] ?? null,
            'category' => $data['category'],
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $vehicle = DB::table('registered_vehicles')->where('id', $vehicleId)->first();
        return response()->json($vehicle, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $vehicle = DB::table('registered_vehicles')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$vehicle) {
            return response()->json(['message' => 'Vehicle not found'], 404);
        }

        $data = $request->validate([
            'plate_number' => 'sometimes|string|max:255',
            'plate_ar' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'vehicle_type' => 'nullable|string|max:255',
            'vehicle_color' => 'nullable|string|max:255',
            'category' => 'sometimes|string|in:authorized,visitor,blacklist,vip',
        ]);

        DB::table('registered_vehicles')
            ->where('id', $id)
            ->update(array_merge($data, ['updated_at' => now()]));

        $updated = DB::table('registered_vehicles')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $vehicle = DB::table('registered_vehicles')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$vehicle) {
            return response()->json(['message' => 'Vehicle not found'], 404);
        }

        DB::table('registered_vehicles')->where('id', $id)->delete();
        return response()->json(['message' => 'Vehicle deleted']);
    }

    public function toggleActive(Request $request, string $id): JsonResponse
    {
        $vehicle = DB::table('registered_vehicles')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$vehicle) {
            return response()->json(['message' => 'Vehicle not found'], 404);
        }

        $newStatus = !$vehicle->is_active;
        DB::table('registered_vehicles')
            ->where('id', $id)
            ->update(['is_active' => $newStatus, 'updated_at' => now()]);

        $updated = DB::table('registered_vehicles')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function getAccessLogs(Request $request): JsonResponse
    {
        $query = DB::table('vehicle_access_logs')
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->get('vehicle_id'));
        }

        if ($request->filled('camera_id')) {
            $query->where('camera_id', $request->get('camera_id'));
        }

        if ($request->filled('direction')) {
            $query->where('direction', $request->get('direction'));
        }

        if ($request->filled('access_granted')) {
            $query->where('access_granted', filter_var($request->get('access_granted'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->get('from'));
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->get('to'));
        }

        $perPage = (int) $request->get('per_page', 15);
        $logs = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($logs);
    }
}

