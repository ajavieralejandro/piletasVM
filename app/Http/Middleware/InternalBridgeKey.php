<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class InternalBridgeKey
{
    public function handle(Request $request, Closure $next)
    {
        $key = $request->header('X-Internal-Key');
        $expected = config('services.internal_bridge.key');

        if (!$key || !$expected || !hash_equals($expected, $key)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
