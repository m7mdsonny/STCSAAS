<?php

namespace App\Http\Controllers;

use App\Models\AiCommand;
use App\Models\AiCommandLog;
use App\Models\AiCommandTarget;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiCommandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $query = AiCommand::with(['targets', 'logs'])->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->get('organization_id'));
        }

        return response()->json($query->paginate((int) $request->get('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'organization_id' => 'nullable|exists:organizations,id',
            'payload' => 'nullable|array',
            'targets' => 'nullable|array',
            'targets.*.target_type' => 'required_with:targets|string',
            'targets.*.target_id' => 'nullable|string',
            'targets.*.meta' => 'nullable|array',
        ]);

        $command = AiCommand::create([
            'title' => $data['title'],
            'organization_id' => $data['organization_id'] ?? null,
            'payload' => $data['payload'] ?? [],
            'status' => 'queued',
        ]);

        foreach ($data['targets'] ?? [] as $target) {
            AiCommandTarget::create([
                'ai_command_id' => $command->id,
                'target_type' => $target['target_type'],
                'target_id' => $target['target_id'] ?? null,
                'meta' => $target['meta'] ?? null,
            ]);
        }

        AiCommandLog::create([
            'ai_command_id' => $command->id,
            'status' => 'queued',
            'message' => 'Command created and queued',
        ]);

        return response()->json($command->load('targets'), 201);
    }

    public function ack(Request $request, AiCommand $aiCommand): JsonResponse
    {
        $data = $request->validate([
            'message' => 'nullable|string',
            'meta' => 'nullable|array',
        ]);

        $aiCommand->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
        ]);

        AiCommandLog::create([
            'ai_command_id' => $aiCommand->id,
            'status' => 'acknowledged',
            'message' => $data['message'] ?? 'Acknowledged',
            'meta' => $data['meta'] ?? null,
        ]);

        return response()->json($aiCommand->fresh('logs'));
    }

    public function retry(Request $request, AiCommand $aiCommand): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $aiCommand->update(['status' => 'queued', 'acknowledged_at' => null]);

        AiCommandLog::create([
            'ai_command_id' => $aiCommand->id,
            'status' => 'queued',
            'message' => 'Command retried',
        ]);

        return response()->json($aiCommand->fresh('logs'));
    }

    public function logs(AiCommand $aiCommand): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        return response()->json($aiCommand->logs()->orderByDesc('created_at')->get());
    }
}
