<?php

namespace App\Http\Controllers;

use App\Models\SystemBackup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

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
            'backup' => 'nullable|file',
            'meta' => 'nullable|array',
        ]);

        if (isset($data['backup'])) {
            $path = $data['backup']->store('backups');
            $status = 'uploaded';
        } else {
            $path = $this->createDatabaseDump();
            $status = 'completed';
        }

        $backup = SystemBackup::create([
            'file_path' => $path,
            'status' => $status,
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

        $this->runRestore(Storage::path($backup->file_path));

        $backup->update(['status' => 'restored']);

        return response()->json(['message' => 'Database restored successfully']);
    }

    public function download(SystemBackup $backup)
    {
        $this->ensureSuperAdmin(request());

        if (!Storage::exists($backup->file_path)) {
            return response()->json(['message' => 'Backup file missing'], 404);
        }

        return Storage::download($backup->file_path, basename($backup->file_path));
    }

    protected function createDatabaseDump(): string
    {
        $connection = config('database.default');
        $config = config("database.connections.$connection");
        $timestamp = now()->format('Ymd_His');
        $filename = "backups/{$connection}_{$timestamp}.sql";

        Storage::makeDirectory('backups');

        if ($config['driver'] === 'mysql') {
            $password = $config['password'] ?? '';
            $command = sprintf(
                'mysqldump -h %s -P %s -u %s %s %s > %s',
                escapeshellarg($config['host']),
                escapeshellarg((string) $config['port']),
                escapeshellarg($config['username']),
                $password ? '-p' . escapeshellarg($password) : '',
                escapeshellarg($config['database']),
                escapeshellarg(Storage::path($filename))
            );

            $process = Process::fromShellCommandline($command);
            $process->setTimeout(300); // 5 minutes
            $process->run();
            
            if (!$process->isSuccessful()) {
                throw new \RuntimeException('Backup failed: ' . $process->getErrorOutput());
            }
        } elseif ($config['driver'] === 'sqlite') {
            $dbPath = $this->resolveSqlitePath($config);
            copy($dbPath, Storage::path($filename));
        } else {
            throw new \RuntimeException('Unsupported database driver for backup');
        }

        return $filename;
    }

    protected function runRestore(string $path): void
    {
        $connection = config('database.default');
        $config = config("database.connections.$connection");

        if ($config['driver'] === 'mysql') {
            $password = $config['password'] ?? '';
            $command = sprintf(
                'mysql -h %s -P %s -u %s %s %s < %s',
                escapeshellarg($config['host']),
                escapeshellarg((string) $config['port']),
                escapeshellarg($config['username']),
                $password ? '-p' . escapeshellarg($password) : '',
                escapeshellarg($config['database']),
                escapeshellarg($path)
            );

            $process = Process::fromShellCommandline($command);
            $process->setTimeout(600); // 10 minutes
            $process->run();

            if (!$process->isSuccessful()) {
                throw new \RuntimeException('Restore failed: ' . $process->getErrorOutput());
            }
        } elseif ($config['driver'] === 'sqlite') {
            $dbPath = $this->resolveSqlitePath($config);
            copy($path, $dbPath);
            DB::purge($connection);
            DB::reconnect($connection);
        } else {
            throw new \RuntimeException('Unsupported database driver for restore');
        }
    }

    protected function resolveSqlitePath(array $config): string
    {
        $dbPath = $config['database'] ?? database_path('database.sqlite');
        if ($dbPath === ':memory:') {
            $dbPath = database_path('database.sqlite');
        }

        if (!file_exists($dbPath)) {
            if (!is_dir(dirname($dbPath))) {
                mkdir(dirname($dbPath), 0755, true);
            }
            touch($dbPath);
        }

        return $dbPath;
    }
}
