<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LicenseController;
use App\Http\Controllers\EdgeController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\NotificationController;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'changePassword']);

        Route::post('/licensing/validate', [LicenseController::class, 'validateKey']);
        Route::post('/edges/heartbeat', [EdgeController::class, 'heartbeat']);
        Route::post('/edges/events', [EventController::class, 'ingest']);
        Route::get('/notifications', [NotificationController::class, 'index']);
    });
});
