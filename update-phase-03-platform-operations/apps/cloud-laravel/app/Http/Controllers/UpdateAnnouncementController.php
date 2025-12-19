<?php

namespace App\Http\Controllers;

use App\Models\UpdateAnnouncement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateAnnouncementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $query = UpdateAnnouncement::query();
        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->get('organization_id'));
        }
        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function publicIndex(): JsonResponse
    {
        $updates = UpdateAnnouncement::where('is_published', true)
            ->orderByDesc('published_at')
            ->get();
        return response()->json($updates);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'organization_id' => 'nullable|exists:organizations,id',
            'is_published' => 'nullable|boolean',
        ]);

        $update = UpdateAnnouncement::create([
            ...$data,
            'published_at' => ($data['is_published'] ?? false) ? now() : null,
        ]);

        return response()->json($update, 201);
    }

    public function update(Request $request, UpdateAnnouncement $update): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'body' => 'nullable|string',
            'organization_id' => 'nullable|exists:organizations,id',
            'is_published' => 'nullable|boolean',
        ]);

        if (array_key_exists('is_published', $data)) {
            $data['published_at'] = $data['is_published'] ? now() : null;
        }

        $update->update($data);

        return response()->json($update);
    }

    public function destroy(UpdateAnnouncement $update): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $update->delete();
        return response()->json(['message' => 'Update removed']);
    }

    public function togglePublish(UpdateAnnouncement $update): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $update->is_published = !$update->is_published;
        $update->published_at = $update->is_published ? now() : null;
        $update->save();

        return response()->json($update);
    }
}
