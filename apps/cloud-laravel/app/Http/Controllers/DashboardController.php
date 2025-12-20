<?php

namespace App\Http\Controllers;

use App\Models\EdgeServer;
use App\Models\License;
use App\Models\Organization;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $user = $request->user();
        
        // If no organization_id provided, use user's organization
        if (!$organizationId && $user) {
            $organizationId = $user->organization_id;
        }

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

        // Edge servers
        $edgeServers = EdgeServer::where('organization_id', $organizationId)->get();
        $onlineServers = $edgeServers->where('online', true)->count();
        $totalServers = $edgeServers->count();
        
        // Cameras (count from cameras table)
        $totalCameras = DB::table('cameras')
            ->where('organization_id', $organizationId)
            ->count();
        $onlineCameras = DB::table('cameras')
            ->where('organization_id', $organizationId)
            ->where('status', 'online')
            ->count();

        // Alerts (today and unresolved)
        $today = Carbon::today();
        $alertsToday = Event::where('organization_id', $organizationId)
            ->whereDate('created_at', $today)
            ->count();
        $unresolvedAlerts = Event::where('organization_id', $organizationId)
            ->where('status', '!=', 'resolved')
            ->count();

        // Attendance (today)
        $attendanceToday = DB::table('attendance_records')
            ->where('organization_id', $organizationId)
            ->whereDate('check_in_time', $today)
            ->count();
        $lateToday = DB::table('attendance_records')
            ->where('organization_id', $organizationId)
            ->whereDate('check_in_time', $today)
            ->where('is_late', true)
            ->count();

        // Visitors (today) - count from people counting events or analytics
        $visitorsToday = Event::where('organization_id', $organizationId)
            ->where('module', 'counter')
            ->whereDate('created_at', $today)
            ->count();
        $yesterdayVisitors = Event::where('organization_id', $organizationId)
            ->where('module', 'counter')
            ->whereDate('created_at', Carbon::yesterday())
            ->count();
        $visitorsTrend = $yesterdayVisitors > 0 ? (($visitorsToday - $yesterdayVisitors) / $yesterdayVisitors) * 100 : 0;

        // Weekly stats (last 7 days)
        $weeklyStats = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dayAlerts = Event::where('organization_id', $organizationId)
                ->whereDate('created_at', $date)
                ->count();
            $dayVisitors = Event::where('organization_id', $organizationId)
                ->where('module', 'counter')
                ->whereDate('created_at', $date)
                ->count();
            
            $dayNames = ['السبت', 'الاحد', 'الاثنين', 'الثلاثاء', 'الاربعاء', 'الخميس', 'الجمعة'];
            $weeklyStats[] = [
                'day' => $dayNames[$date->dayOfWeek],
                'alerts' => $dayAlerts,
                'visitors' => $dayVisitors,
            ];
        }

        // Recent alerts
        $recentAlerts = Event::where('organization_id', $organizationId)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => (string) $event->id,
                    'module' => $event->module ?? 'unknown',
                    'event_type' => $event->event_type ?? 'unknown',
                    'severity' => $event->severity ?? 'medium',
                    'title' => $event->title ?? 'Event',
                    'created_at' => $event->created_at->toISOString(),
                    'status' => $event->status ?? 'new',
                ];
            });

        return response()->json([
            'edge_servers' => ['online' => $onlineServers, 'total' => $totalServers],
            'cameras' => ['online' => $onlineCameras, 'total' => $totalCameras],
            'alerts' => ['today' => $alertsToday, 'unresolved' => $unresolvedAlerts],
            'attendance' => ['today' => $attendanceToday, 'late' => $lateToday],
            'visitors' => ['today' => $visitorsToday, 'trend' => $visitorsTrend],
            'recent_alerts' => $recentAlerts,
            'weekly_stats' => $weeklyStats,
        ]);
    }

    public function admin(): JsonResponse
    {
        $totalOrganizations = Organization::count();
        $activeOrganizations = Organization::where('is_active', true)->count();
        $totalEdgeServers = EdgeServer::count();
        $onlineServers = EdgeServer::where('online', true)->count();
        $totalCameras = DB::table('cameras')->count();
        $alertsToday = Event::whereDate('created_at', now()->toDateString())->count();
        
        // Calculate revenue from active subscriptions
        $revenueThisMonth = DB::table('organizations')
            ->join('subscription_plans', 'organizations.subscription_plan', '=', 'subscription_plans.name')
            ->where('organizations.is_active', true)
            ->sum('subscription_plans.price_monthly');

        return response()->json([
            'total_organizations' => $totalOrganizations,
            'active_organizations' => $activeOrganizations,
            'total_edge_servers' => $totalEdgeServers,
            'online_edge_servers' => $onlineServers,
            'total_cameras' => $totalCameras,
            'alerts_today' => $alertsToday,
            'revenue_this_month' => $revenueThisMonth ?? 0,
            'total_users' => User::count(),
            'active_licenses' => License::where('status', 'active')->count(),
        ]);
    }
}
