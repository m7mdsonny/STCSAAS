<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\EdgeServer;
use App\Models\Event;

class EdgeController extends Controller
{
    public function heartbeat(Request $request): JsonResponse
    {
        $request->validate([
            'edge_id' => 'required|string',
            'version' => 'required|string',
            'online' => 'required|boolean'
        ]);

        $edge = EdgeServer::updateOrCreate(
            ['edge_id' => $request->edge_id],
            [
                'version' => $request->version,
                'online' => $request->boolean('online'),
                'last_seen_at' => now(),
            ]
        );

        return response()->json(['ok' => true, 'edge' => $edge]);
    }
}
