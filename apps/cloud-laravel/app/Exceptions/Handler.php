<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // You may report additional exceptions here.
        });
    }

    /**
     * Render an authentication exception into an HTTP response.
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        return redirect()->guest('/login');
    }

    /**
     * Render a 403 Forbidden exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        // Handle 403 Forbidden exceptions
        if ($exception instanceof \Illuminate\Auth\Access\AuthorizationException) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $exception->getMessage() ?: 'Forbidden.',
                ], 403);
            }
        }

        // Handle 404 Not Found for API routes
        if ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Endpoint not found.',
                ], 404);
            }
        }

        return parent::render($request, $exception);
    }
}
