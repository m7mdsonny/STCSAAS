<?php

namespace App\Http\Controllers;

use App\Models\SystemBackup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SystemBackupController extends Controller
{
    public function index(): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        return response()->json(SystemBackup::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'backup' => 'required|file',
            'meta' => 'nullable|array',
        ]);

        $path = $data['backup']->store('backups');

        $backup = SystemBackup::create([
            'file_path' => $path,
            'meta' => $data['meta'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        return response()->json($backup, 201);
    }

    public function restore(SystemBackup $backup): JsonResponse
    {
        $this->ensureSuperAdmin(request());
        if (!Storage::exists($backup->file_path)) {
            return response()->json(['message' => 'Backup file missing'], 404);
        }

        return response()->json(['message' => 'Backup located. Restore process should be executed by ops tooling.']);
    }
}
