<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Helpers\RoleHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Event::query()->where('event_type', 'alert');

        // Filter by organization
        if ($user->organization_id) {
            $query->where('organization_id', $user->organization_id);
        } elseif (!RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            return response()->json(['data' => [], 'total' => 0, 'per_page' => 15, 'current_page' => 1, 'last_page' => 1]);
        }

        // Super admin can filter by organization
        if ($request->filled('organization_id') && RoleHelper::isSuperAdmin($user->role, $user->is_super_admin ?? false)) {
            $query->where('organization_id', $request->get('organization_id'));
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('metadata->status', $request->get('status'));
        }

        if ($request->filled('severity')) {
            $query->where('metadata->severity', $request->get('severity'));
        }

        if ($request->filled('module')) {
            $query->where('metadata->module', $request->get('module'));
        }

        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->get('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->get('end_date'));
        }

        $perPage = (int) $request->get('per_page', 15);
        $page = (int) $request->get('page', 1);
        
        $events = $query->orderByDesc('created_at')->paginate($perPage, ['*'], 'page', $page);

        // Transform events to alerts format
        $alerts = $events->getCollection()->map(function ($event) {
            $meta = is_array($event->meta) ? $event->meta : [];
            return [
                'id' => (string) $event->id,
                'title' => $event->title ?? $meta['title'] ?? $meta['message'] ?? 'تنبيه',
                'message' => $event->description ?? $meta['message'] ?? '',
                'severity' => $event->severity ?? $meta['severity'] ?? 'medium',
                'status' => $meta['status'] ?? ($event->resolved_at ? 'resolved' : ($event->acknowledged_at ? 'acknowledged' : 'new')),
                'module' => $meta['module'] ?? null,
                'camera_id' => $event->camera_id ?? null,
                'organization_id' => $event->organization_id ?? null,
                'created_at' => $event->occurred_at ? $event->occurred_at->toISOString() : $event->created_at->toISOString(),
                'updated_at' => $event->updated_at ? $event->updated_at->toISOString() : $event->created_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => $alerts,
            'total' => $events->total(),
            'per_page' => $events->perPage(),
            'current_page' => $events->currentPage(),
            'last_page' => $events->lastPage(),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $event = Event::where('event_type', 'alert')->findOrFail($id);
        $meta = is_array($event->meta) ? $event->meta : [];
        
        $alert = [
            'id' => (string) $event->id,
            'title' => $event->title ?? $meta['title'] ?? $meta['message'] ?? 'تنبيه',
            'message' => $event->description ?? $meta['message'] ?? '',
            'severity' => $event->severity ?? $meta['severity'] ?? 'medium',
            'status' => $meta['status'] ?? ($event->resolved_at ? 'resolved' : ($event->acknowledged_at ? 'acknowledged' : 'new')),
            'module' => $meta['module'] ?? null,
            'camera_id' => $event->camera_id ?? null,
            'organization_id' => $event->organization_id ?? null,
            'created_at' => $event->occurred_at ? $event->occurred_at->toISOString() : $event->created_at->toISOString(),
            'updated_at' => $event->updated_at ? $event->updated_at->toISOString() : $event->created_at->toISOString(),
        ];

        return response()->json($alert);
    }

    public function acknowledge(string $id): JsonResponse
    {
        $event = Event::where('event_type', 'alert')->findOrFail($id);
        $meta = is_array($event->meta) ? $event->meta : [];
        $meta['status'] = 'acknowledged';
        $event->update([
            'acknowledged_at' => now(),
            'acknowledged_by' => request()->user()->id,
            'meta' => $meta,
        ]);

        return response()->json(['message' => 'Alert acknowledged']);
    }

    public function resolve(string $id): JsonResponse
    {
        $event = Event::where('event_type', 'alert')->findOrFail($id);
        $meta = is_array($event->meta) ? $event->meta : [];
        $meta['status'] = 'resolved';
        $event->update([
            'resolved_at' => now(),
            'resolved_by' => request()->user()->id,
            'meta' => $meta,
        ]);

        return response()->json(['message' => 'Alert resolved']);
    }

    public function markFalseAlarm(string $id): JsonResponse
    {
        $event = Event::where('event_type', 'alert')->findOrFail($id);
        $meta = is_array($event->meta) ? $event->meta : [];
        $meta['status'] = 'false_alarm';
        $event->update(['meta' => $meta]);

        return response()->json(['message' => 'Alert marked as false alarm']);
    }
}

