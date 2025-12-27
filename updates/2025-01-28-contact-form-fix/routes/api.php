<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PublicContentController;

// Add this route in the public routes section (around line 35-37)
Route::prefix('v1')->group(function () {
    Route::get('/public/landing', [PublicContentController::class, 'landing']);
    Route::post('/public/contact', [PublicContentController::class, 'submitContact']); // ADD THIS LINE
    Route::get('/public/updates', [UpdateAnnouncementController::class, 'publicIndex']);
    Route::get('/branding', [BrandingController::class, 'showPublic']);
    // ... rest of routes
});

