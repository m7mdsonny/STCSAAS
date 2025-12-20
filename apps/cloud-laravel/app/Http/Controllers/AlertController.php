<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;
use Illuminate\Support\Facades\DB;

class AlertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()
            ->where('organization_id', $request->user()->organization_id);

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('severity')) {
            $query->where('severity', $request->get('severity'));
        }

        if ($request->filled('module')) {
            $query->where('module', $request->get('module'));
        }

        if ($request->filled('camera_id')) {
            $query->whereJsonContains('meta->camera_id', $request->get('camera_id'));
        }

        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->get('from'));
        }

        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->get('to'));
        }

        $perPage = (int) $request->get('per_page', 15);
        $alerts = $query->orderByDesc('created_at')->paginate($perPage);

        // Transform events to alerts format
        $transformed = $alerts->getCollection()->map(function ($event) {
            return [
                'id' => (string) $event->id,
                'title' => $event->title ?? ($event->event_type ?? 'Alert'),
                'description' => $event->description ?? '',
                'severity' => $event->severity ?? 'medium',
                'status' => $event->status ?? 'new',
                'module' => $event->module ?? 'unknown',
                'camera_id' => $event->meta['camera_id'] ?? null,
                'created_at' => $event->created_at->toISOString(),
                'updated_at' => $event->updated_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => $transformed,
            'current_page' => $alerts->currentPage(),
            'last_page' => $alerts->lastPage(),
            'per_page' => $alerts->perPage(),
            'total' => $alerts->total(),
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $event = Event::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$event) {
            return response()->json(['message' => 'Alert not found'], 404);
        }

        $alert = [
            'id' => (string) $event->id,
            'title' => $event->title ?? ($event->event_type ?? 'Alert'),
            'description' => $event->description ?? '',
            'severity' => $event->severity ?? 'medium',
            'status' => $event->status ?? 'new',
            'module' => $event->module ?? 'unknown',
            'camera_id' => $event->meta['camera_id'] ?? null,
            'created_at' => $event->created_at->toISOString(),
            'updated_at' => $event->updated_at->toISOString(),
        ];

        return response()->json($alert);
    }

    public function acknowledge(Request $request, string $id): JsonResponse
    {
        $event = Event::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$event) {
            return response()->json(['message' => 'Alert not found'], 404);
        }

        $event->update(['status' => 'acknowledged']);

        return response()->json([
            'id' => (string) $event->id,
            'status' => 'acknowledged',
        ]);
    }

    public function resolve(Request $request, string $id): JsonResponse
    {
        $event = Event::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$event) {
            return response()->json(['message' => 'Alert not found'], 404);
        }

        $event->update(['status' => 'resolved']);

        return response()->json([
            'id' => (string) $event->id,
            'status' => 'resolved',
        ]);
    }

    public function markFalseAlarm(Request $request, string $id): JsonResponse
    {
        $event = Event::where('id', $id)
            ->where('organization_id', $request->user()->organization_id)
            ->first();

        if (!$event) {
            return response()->json(['message' => 'Alert not found'], 404);
        }

        $event->update(['status' => 'false_alarm']);

        return response()->json([
            'id' => (string) $event->id,
            'status' => 'false_alarm',
        ]);
    }

    public function bulkAcknowledge(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'string',
        ]);

        Event::whereIn('id', $request->ids)
            ->where('organization_id', $request->user()->organization_id)
            ->update(['status' => 'acknowledged']);

        return response()->json(['message' => 'Alerts acknowledged']);
    }

    public function bulkResolve(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'string',
        ]);

        Event::whereIn('id', $request->ids)
            ->where('organization_id', $request->user()->organization_id)
            ->update(['status' => 'resolved']);

        return response()->json(['message' => 'Alerts resolved']);
    }
}

