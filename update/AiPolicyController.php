<?php

namespace App\Http\Controllers;

use App\Models\AiPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiPolicyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AiPolicy::query();

        if ($orgId = $request->get('organization_id')) {
            $query->where('organization_id', $orgId);
        }

        return response()->json($query->orderByDesc('created_at')->get());
    }

    public function show(AiPolicy $aiPolicy): JsonResponse
    {
        return response()->json($aiPolicy->load('events'));
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $data = $this->validateData($request);
        $policy = AiPolicy::create($data);

        return response()->json($policy, 201);
    }

    public function update(Request $request, AiPolicy $aiPolicy): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $aiPolicy->update($this->validateData($request, false));
        return response()->json($aiPolicy);
    }

    public function destroy(AiPolicy $aiPolicy): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        $aiPolicy->delete();
        return response()->json(['message' => 'AI policy deleted']);
    }

    public function addEvent(Request $request, AiPolicy $aiPolicy): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $data = $request->validate([
            'event_type' => 'required|string',
            'label' => 'nullable|string',
            'payload' => 'nullable|array',
            'weight' => 'nullable|numeric',
        ]);

        $event = $aiPolicy->events()->create($data);

        return response()->json($event, 201);
    }

    public function effective(Request $request): JsonResponse
    {
        $user = $request->user();
        $organizationId = $request->get('organization_id') ?? $user?->organization_id;

        $policy = null;
        if ($organizationId) {
            $policy = AiPolicy::where('organization_id', $organizationId)
                ->where('is_enabled', true)
                ->latest()
                ->first();
        }

        if (!$policy) {
            $policy = AiPolicy::whereNull('organization_id')
                ->where('is_enabled', true)
                ->latest()
                ->first();
        }

        if (!$policy) {
            return response()->json([
                'is_enabled' => false,
                'modules' => [],
                'thresholds' => [],
                'actions' => [],
                'feature_flags' => [],
                'events' => [],
            ]);
        }

        $policy->loadMissing('events');

        return response()->json($policy);
    }

    protected function validateData(Request $request, bool $requireName = true): array
    {
        return $request->validate([
            'organization_id' => 'nullable|exists:organizations,id',
            'name' => ($requireName ? 'required' : 'sometimes') . '|string|max:255',
            'is_enabled' => 'nullable|boolean',
            'modules' => 'nullable|array',
            'thresholds' => 'nullable|array',
            'actions' => 'nullable|array',
            'feature_flags' => 'nullable|array',
        ]);
    }

    protected function ensureSuperAdmin(Request $request): void
    {
        $user = $request->user();

        $isSuperAdmin = false;
        if ($user) {
            if (method_exists($user, 'isSuperAdmin')) {
                $isSuperAdmin = (bool) $user->isSuperAdmin();
            } else {
                $isSuperAdmin = ($user->role === 'super_admin') || (bool) $user->is_super_admin;
            }
        }

        if (!$isSuperAdmin) {
            abort(403, 'Super admin access required');
        }
    }
}
