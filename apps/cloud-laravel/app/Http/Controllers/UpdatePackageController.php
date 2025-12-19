<?php

namespace App\Http\Controllers;

use App\Models\UpdatePackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdatePackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        return response()->json(UpdatePackage::orderByDesc('created_at')->get());
    }

    public function show(Request $request, UpdatePackage $updatePackage): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        return response()->json($updatePackage);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'version' => 'required|string|max:100',
            'title' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'payload' => 'nullable|array',
            'target_all' => 'nullable|boolean',
            'target_organizations' => 'nullable|array',
        ]);

        $package = UpdatePackage::create([
            ...$data,
            'target_all' => $data['target_all'] ?? true,
            'created_by' => $request->user()?->id,
            'status' => 'pending',
        ]);

        return response()->json($package, 201);
    }

    public function apply(Request $request, UpdatePackage $updatePackage): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $updatePackage->update([
            'status' => $request->get('status', 'applied'),
            'applied_at' => now(),
        ]);

        return response()->json($updatePackage);
    }

    public function latest(Request $request): JsonResponse
    {
        $orgId = $request->get('organization_id');
        $query = UpdatePackage::where('status', 'applied');

        if ($orgId) {
            $query->where(function ($q) use ($orgId) {
                $q->where('target_all', true)
                    ->orWhereJsonContains('target_organizations', $orgId);
            });
        }

        $latest = $query->orderByDesc('applied_at')->first();

        if (!$latest) {
            return response()->json(['message' => 'No updates available'], 404);
        }

        return response()->json($latest);
    }
}
