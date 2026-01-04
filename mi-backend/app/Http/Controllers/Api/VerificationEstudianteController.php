<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Estudiante;

class VerificationEstudianteController extends Controller
{
    public function verify(Request $request, $id)
    {
        $estudiante = Estudiante::findOrFail($id);

        // Diseño base HTML (Fondo Oscuro y Tarjeta Blanca)
        $htmlBase = '
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificación de Cuenta</title>
                <style>
                    /* Definición de Colores */
                    :root {
                        --azul-uchile: #0033A0; /* Azul Institucional */
                        --rojo-uchile: #D50032; /* Rojo Institucional */
                        --fondo-oscuro: #001529; /* Azul muy oscuro (Casi negro) para el fondo */
                    }
                    body {
                        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                        background-color: var(--fondo-oscuro);
                        
                        background: linear-gradient(135deg, #001e3c 0%, #000a12 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .card {
                        background-color: #ffffff;
                        padding: 50px 40px;
                        border-radius: 12px;
                        
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); /* Sombra más fuerte para contrastar */
                        text-align: center;
                        max-width: 450px;
                        width: 90%;
                    }
                    .logo {
                        max-width: 180px;
                        margin-bottom: 30px;
                    }
                    h1 {
                        color: var(--azul-uchile);
                        font-size: 28px;
                        margin-bottom: 15px;
                        font-weight: 700;
                    }
                    h2 {
                        color: var(--rojo-uchile);
                        font-size: 20px;
                        margin-bottom: 25px;
                        font-weight: 600;
                    }
                    p {
                        color: #555;
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 20px;
                    }
                    .highlight-red {
                        color: var(--rojo-uchile);
                        font-weight: bold;
                    }
                    .footer-text {
                        margin-top: 40px;
                        font-size: 0.9em;
                        color: #999;
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="card">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrCuvWUPUiRQLWZ_1invJtUOztfikObOdOXA&s" alt="Logo Institucional" class="logo">
                    
                    %CONTENT%
                    
                </div>
            </body>
            </html>
        ';

        // --- CASO 1: Enlace inválido ---
        if (!$request->hasValidSignature()) {
            $content = '
                <h1>Ups... Algo salió mal.</h1>
                <h2>El enlace no es válido.</h2>
                <p>El enlace de verificación ha <span class="highlight-red">expirado o es incorrecto</span>.</p>
                <p>Por favor, solicita un nuevo correo de activación.</p>
            ';
            return response()->make(str_replace('%CONTENT%', $content, $htmlBase), 403);
        }

        // --- CASO 2: Verificación Exitosa ---
        if (!$estudiante->hasVerifiedEmail()) {
            $estudiante->markEmailAsVerified();
        }

        $content = '
            <h1>¡Verificación Exitosa!</h1>
            <p>Hola <strong>' . $estudiante->nombres . '</strong>, gracias por confirmar tu correo.</p>
            <h2>Tu cuenta ha sido activada.</h2>
            <p>Tu registro en el <span style="color: var(--azul-uchile); font-weight: bold;">Sistema de Habilidades Blandas</span> está completo.</p>
        <p style="font-weight: 500; color: #333;">Ya puedes cerrar esta pestaña.</p>
            ';

        return response()->make(str_replace('%CONTENT%', $content, $htmlBase), 200);
    }
}