<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Models\User;

class NewPasswordController extends Controller
{
    public function forgotPassword(Request $request)
    {
        $request->validate(['cedula' => 'required']);

        $user = User::where('cedula', $request->cedula)->first();

        // Si no existe, fingimos éxito por seguridad
        if (!$user) {
            return response()->json(['message' => 'Si la cédula existe, se ha enviado un enlace.'], 200);
        }

        // 👇 BLOQUEO DE SEGURIDAD: Verificar dominio antes de enviar
        if (!preg_match('/^.+@(ueb\.edu\.ec|mailes\.ueb\.edu\.ec)$/i', $user->email)) {
            return response()->json([
                'message' => 'Este usuario no tiene un correo institucional válido asociado.'
            ], 400);
        }

        $token = Password::broker()->createToken($user);
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173'); 
        $link = "{$frontendUrl}/reset-password/{$token}?email={$user->email}";

        try {
            Mail::send([], [], function ($message) use ($user, $link) {
                $message->to($user->email)
                        ->subject('Restablecer Contraseña - UEB')
                        ->html("
                            <div style='font-family: sans-serif; padding: 20px; color: #333;'>
                                <h2>Hola, {$user->nombres}</h2>
                                <p>Has solicitado restablecer tu contraseña.</p>
                                <p>Haz clic en el siguiente botón para continuar:</p>
                                <div style='margin: 25px 0;'>
                                    <a href='{$link}' style='background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;'>Restablecer Contraseña</a>
                                </div>
                                <p style='font-size: 12px; color: #666;'>Si no fuiste tú, ignora este mensaje.</p>
                            </div>
                        ");
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al enviar el correo.'], 500);
        }

        return response()->json(['message' => 'Enlace enviado a tu correo institucional.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();
                event(new PasswordReset($user));
            }
        );

        return $status == Password::PASSWORD_RESET
            ? response()->json(['message' => '¡Contraseña restablecida correctamente!'])
            : response()->json(['message' => 'El enlace es inválido o ha expirado.'], 400);
    }
}