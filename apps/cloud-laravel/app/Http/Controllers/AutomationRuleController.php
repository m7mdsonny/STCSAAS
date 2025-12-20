<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AutomationRuleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('automation_rules')
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('integration_id')) {
            $query->where('integration_id', $request->get('integration_id'));
        }

        if ($request->filled('trigger_module')) {
            $query->where('trigger_module', $request->get('trigger_module'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->get('per_page', 15);
        $rules = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json($rules);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $rule = DB::table('automation_rules')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$rule) {
            return response()->json(['message' => 'Automation rule not found'], 404);
        }

        return response()->json($rule);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'integration_id' => 'nullable|string|exists:integrations,id',
            'trigger_module' => 'required|string',
            'trigger_event' => 'required|string',
            'trigger_conditions' => 'nullable|array',
            'action_type' => 'required|string',
            'action_command' => 'required|array',
            'cooldown_seconds' => 'nullable|integer|min:0',
            'priority' => 'nullable|integer|min:0',
        ]);

        $ruleId = DB::table('automation_rules')->insertGetId([
            'organization_id' => $request->user()->organization_id,
            'integration_id' => $data['integration_id'] ?? null,
            'name' => $data['name'],
            'name_ar' => $data['name_ar'] ?? null,
            'description' => $data['description'] ?? null,
            'trigger_module' => $data['trigger_module'],
            'trigger_event' => $data['trigger_event'],
            'trigger_conditions' => json_encode($data['trigger_conditions'] ?? []),
            'action_type' => $data['action_type'],
            'action_command' => json_encode($data['action_command']),
            'cooldown_seconds' => $data['cooldown_seconds'] ?? 60,
            'priority' => $data['priority'] ?? 0,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $rule = DB::table('automation_rules')->where('id', $ruleId)->first();
        return response()->json($rule, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $rule = DB::table('automation_rules')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$rule) {
            return response()->json(['message' => 'Automation rule not found'], 404);
        }

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'trigger_module' => 'sometimes|string',
            'trigger_event' => 'sometimes|string',
            'trigger_conditions' => 'nullable|array',
            'action_type' => 'sometimes|string',
            'action_command' => 'sometimes|array',
            'cooldown_seconds' => 'nullable|integer|min:0',
            'priority' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $updateData = [];
        if (isset($data['name'])) $updateData['name'] = $data['name'];
        if (isset($data['name_ar'])) $updateData['name_ar'] = $data['name_ar'];
        if (isset($data['description'])) $updateData['description'] = $data['description'];
        if (isset($data['trigger_module'])) $updateData['trigger_module'] = $data['trigger_module'];
        if (isset($data['trigger_event'])) $updateData['trigger_event'] = $data['trigger_event'];
        if (isset($data['trigger_conditions'])) $updateData['trigger_conditions'] = json_encode($data['trigger_conditions']);
        if (isset($data['action_type'])) $updateData['action_type'] = $data['action_type'];
        if (isset($data['action_command'])) $updateData['action_command'] = json_encode($data['action_command']);
        if (isset($data['cooldown_seconds'])) $updateData['cooldown_seconds'] = $data['cooldown_seconds'];
        if (isset($data['priority'])) $updateData['priority'] = $data['priority'];
        if (isset($data['is_active'])) $updateData['is_active'] = $data['is_active'];
        $updateData['updated_at'] = now();

        DB::table('automation_rules')->where('id', $id)->update($updateData);

        $updated = DB::table('automation_rules')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $rule = DB::table('automation_rules')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$rule) {
            return response()->json(['message' => 'Automation rule not found'], 404);
        }

        DB::table('automation_rules')->where('id', $id)->delete();
        return response()->json(['message' => 'Automation rule deleted']);
    }

    public function toggleActive(Request $request, string $id): JsonResponse
    {
        $rule = DB::table('automation_rules')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$rule) {
            return response()->json(['message' => 'Automation rule not found'], 404);
        }

        $newStatus = !$rule->is_active;
        DB::table('automation_rules')
            ->where('id', $id)
            ->update(['is_active' => $newStatus, 'updated_at' => now()]);

        $updated = DB::table('automation_rules')->where('id', $id)->first();
        return response()->json($updated);
    }

    public function test(Request $request, string $id): JsonResponse
    {
        $rule = DB::table('automation_rules')
            ->where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$rule) {
            return response()->json(['message' => 'Automation rule not found'], 404);
        }

        // TODO: Implement rule testing
        return response()->json([
            'success' => true,
            'message' => 'Rule test executed (simulated)',
        ]);
    }

    public function getLogs(Request $request): JsonResponse
    {
        $query = DB::table('automation_logs')
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('automation_rule_id')) {
            $query->where('automation_rule_id', $request->get('automation_rule_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
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

    public function getAvailableTriggers(): JsonResponse
    {
        // Return available trigger modules and events
        return response()->json([
            ['module' => 'fire', 'events' => ['fire_detected', 'smoke_detected']],
            ['module' => 'face', 'events' => ['face_recognized', 'face_not_recognized', 'blacklist_detected']],
            ['module' => 'counter', 'events' => ['crowd_detected', 'occupancy_limit_exceeded']],
            ['module' => 'vehicle', 'events' => ['vehicle_recognized', 'unauthorized_vehicle']],
            ['module' => 'attendance', 'events' => ['check_in', 'check_out', 'late_arrival']],
        ]);
    }

    public function getAvailableActions(): JsonResponse
    {
        // Return available action types
        return response()->json([
            ['type' => 'notification', 'name' => 'Send Notification', 'icon' => 'bell'],
            ['type' => 'siren', 'name' => 'Activate Siren', 'icon' => 'volume2'],
            ['type' => 'gate_open', 'name' => 'Open Gate', 'icon' => 'door-open'],
            ['type' => 'gate_close', 'name' => 'Close Gate', 'icon' => 'door-closed'],
            ['type' => 'http_request', 'name' => 'HTTP Request', 'icon' => 'globe'],
            ['type' => 'mqtt_publish', 'name' => 'MQTT Publish', 'icon' => 'radio'],
        ]);
    }
}

