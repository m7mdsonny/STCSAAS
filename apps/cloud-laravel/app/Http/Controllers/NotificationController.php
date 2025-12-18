<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Notification::latest()->limit(100)->get());
    }
}
