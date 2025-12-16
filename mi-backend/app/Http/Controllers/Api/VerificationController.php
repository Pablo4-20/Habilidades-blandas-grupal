<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;

class VerificationController extends Controller
{
    public function verify(Request $request, $id)
    {
        // 1. Buscar usuario
        $user = User::findOrFail($id);

        // 2. Verificar firma de seguridad del enlace (Evita hackeos)
        if (!$request->hasValidSignature()) {
            // Redirigir al frontend con error
            return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5173') . '/login?error=invalid_link');
        }

        // 3. Verificar correo si no lo está
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        // 4. Redirigir al Frontend con mensaje de éxito
        return redirect(env('FRONTEND_URL', 'http://127.0.0.1:5173') . '/login?verified=true');
    }

    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'El correo ya está verificado.'], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'Enlace de verificación reenviado.']);
    }
}