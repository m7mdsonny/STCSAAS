<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PersonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('registered_faces')
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('category')) {
            $query->where('category', $request->get('category'));
        }

        if ($request->filled('department')) {
            $query->where('department', $request->get('department'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('person_name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $people = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($people);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $person = DB::table('registered_faces')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$person) {
            return response()->json(['message' => 'Person not found'], 404);
        }

        return response()->json($person);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'person_name' => 'required|string|max:255',
            'employee_id' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'category' => 'required|string|in:employee,visitor,blacklist,vip',
            'photo_url' => 'nullable|string',
        ]);

        $personId = DB::table('registered_faces')->insertGetId([
            'organization_id' => $request->user()->organization_id,
            'person_name' => $data['person_name'],
            'employee_id' => $data['employee_id'] ?? null,
            'department' => $data['department'] ?? null,
            'category' => $data['category'],
            'photo_url' => $data['photo_url'] ?? null,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $person = DB::table('registered_faces')->where('id', $personId)->first();
        return response()->json($person, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $person = DB::table('registered_faces')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$person) {
            return response()->json(['message' => 'Person not found'], 404);
        }

        $data = $request->validate([
            'person_name' => 'sometimes|string|max:255',
            'employee_id' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'category' => 'sometimes|string|in:employee,visitor,blacklist,vip',
            'photo_url' => 'nullable|string',
        ]);

        DB::table('registered_faces')
            ->where('id', $id)
            ->update(array_merge($data, ['updated_at' => now()]));

        $updated = DB::table('registered_faces')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $person = DB::table('registered_faces')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$person) {
            return response()->json(['message' => 'Person not found'], 404);
        }

        DB::table('registered_faces')->where('id', $id)->delete();
        return response()->json(['message' => 'Person deleted']);
    }

    public function toggleActive(Request $request, string $id): JsonResponse
    {
        $person = DB::table('registered_faces')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$person) {
            return response()->json(['message' => 'Person not found'], 404);
        }

        $newStatus = !$person->is_active;
        DB::table('registered_faces')
            ->where('id', $id)
            ->update(['is_active' => $newStatus, 'updated_at' => now()]);

        $updated = DB::table('registered_faces')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function uploadPhoto(Request $request, string $id): JsonResponse
    {
        $person = DB::table('registered_faces')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$person) {
            return response()->json(['message' => 'Person not found'], 404);
        }

        $request->validate([
            'photo' => 'required|image|max:5120',
        ]);

        // TODO: Implement file upload to storage
        $photoUrl = '/storage/photos/' . uniqid() . '.jpg';

        DB::table('registered_faces')
            ->where('id', $id)
            ->update(['photo_url' => $photoUrl, 'updated_at' => now()]);

        $updated = DB::table('registered_faces')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function getDepartments(Request $request): JsonResponse
    {
        $departments = DB::table('registered_faces')
            ->where('organization_id', $request->user()->organization_id)
            ->whereNotNull('department')
            ->distinct()
            ->pluck('department')
            ->filter()
            ->values();

        return response()->json($departments->toArray());
    }
}

