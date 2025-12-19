<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Event;
use App\Models\EdgeServer;

class EventController extends Controller
{
    public function ingest(Request $request): JsonResponse
    {
        $request->validate([
            'edge_id' => 'required|string',
            'event_type' => 'required|string',
            'severity' => 'required|string|in:info,warning,critical',
            'occurred_at' => 'required|date',
            'camera_id' => 'nullable|string',
            'meta' => 'array'
        ]);

        $edge = EdgeServer::where('edge_id', $request->edge_id)->first();

        if (!$edge) {
            return response()->json(['message' => 'Edge not registered'], 422);
        }

        if ($request->user() && !$request->user()->is_super_admin && $request->user()->organization_id !== $edge->organization_id) {
            return response()->json(['message' => 'Unauthorized edge'], 403);
        }

        $event = Event::create([
            'organization_id' => $edge?->organization_id,
            'edge_server_id' => $edge?->id,
            'edge_id' => $request->edge_id,
            'event_type' => $request->event_type,
            'severity' => $request->severity,
            'occurred_at' => $request->occurred_at,
            'meta' => [
                ...$request->input('meta', []),
                'camera_id' => $request->input('camera_id'),
            ],
        ]);

        return response()->json(['ok' => true, 'event_id' => $event->id]);
    }
}
