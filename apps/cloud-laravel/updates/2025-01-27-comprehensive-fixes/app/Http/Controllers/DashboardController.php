<?php

namespace App\Http\Controllers;

use App\Helpers\RoleHelper;
use App\Models\Camera;
use App\Models\EdgeServer;
use App\Models\Event;
use App\Models\License;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function admin(): JsonResponse
    {
        $totalOrganizations = Organization::count();
        $activeOrganizations = Organization::where('is_active', true)->count();
        $totalEdgeServers = EdgeServer::count();
        $onlineServers = EdgeServer::where('online', true)->count();
        $totalCameras = Camera::count();
        $alertsToday = Event::whereDate('occurred_at', now()->toDateString())->count();

        return response()->json([
            'total_organizations' => $totalOrganizations,
            'active_organizations' => $activeOrganizations,
            'total_edge_servers' => $totalEdgeServers,
            'online_edge_servers' => $onlineServers,
            'total_cameras' => $totalCameras,
            'alerts_today' => $alertsToday,
            'revenue_this_month' => SubscriptionPlan::sum('price_monthly'),
            'users' => User::count(),
        ]);
    }

    public function organization(Request $request): JsonResponse
    {
        $user = $request->user();
        $organizationId = $user->organization_id;

        if (!$organizationId) {
            return response()->json([
                'edge_servers' => ['online' => 0, 'total' => 0],
                'cameras' => ['online' => 0, 'total' => 0],
                'alerts' => ['today' => 0, 'unresolved' => 0],
                'attendance' => ['today' => 0, 'late' => 0],
                'visitors' => ['today' => 0, 'trend' => 0],
                'recent_alerts' => [],
                'weekly_stats' => [],
            ]);
        }

        $edgeServers = EdgeServer::where('organization_id', $organizationId)->get();
        $cameras = Camera::where('organization_id', $organizationId)->get();
        $alertsToday = Event::where('organization_id', $organizationId)
            ->whereDate('occurred_at', now()->toDateString())
            ->count();
        $unresolvedAlerts = Event::where('organization_id', $organizationId)
            ->whereNull('resolved_at')
            ->count();
        $recentAlerts = Event::where('organization_id', $organizationId)
            ->orderByDesc('occurred_at')
            ->limit(10)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'module' => $event->meta['module'] ?? 'unknown',
                    'event_type' => $event->event_type,
                    'severity' => $event->severity,
                    'title' => $event->meta['title'] ?? $event->event_type,
                    'created_at' => $event->occurred_at->toISOString(),
                    'status' => $event->resolved_at ? 'resolved' : 'new',
                ];
            });

        return response()->json([
            'edge_servers' => [
                'online' => $edgeServers->where('online', true)->count(),
                'total' => $edgeServers->count(),
            ],
            'cameras' => [
                'online' => $cameras->where('status', 'online')->count(),
                'total' => $cameras->count(),
            ],
            'alerts' => [
                'today' => $alertsToday,
                'unresolved' => $unresolvedAlerts,
            ],
            'attendance' => [
                'today' => 0,
                'late' => 0,
            ],
            'visitors' => [
                'today' => 0,
                'trend' => 0,
            ],
            'recent_alerts' => $recentAlerts,
            'weekly_stats' => [],
        ]);
    }
}
