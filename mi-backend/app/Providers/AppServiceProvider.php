<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
use App\Models\Estudiante; 

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 1. Personalización de la URL de verificación
        VerifyEmail::createUrlUsing(function ($notifiable) {
            
           
            // Verificamos si la variable $notifiable es una instancia del Modelo Estudiante.
            // Esto es más seguro que buscar un campo "rol" que podría no existir.
            
            if ($notifiable instanceof Estudiante) {
                // Generamos la ruta especial para estudiantes
                return URL::temporarySignedRoute(
                    'verification.verify.student', 
                    Carbon::now()->addDays(30), 
                    [
                        'id' => $notifiable->getKey(),
                        'hash' => sha1($notifiable->getEmailForVerification()),
                    ]
                );
            }

            // Si NO es estudiante (es Docente/Admin), usamos la ruta estándar
            return URL::temporarySignedRoute(
                'verification.verify', 
                Carbon::now()->addDays(30), 
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );
        });

        // 2. Personalización del contenido del correo
        VerifyEmail::toMailUsing(function (object $notifiable, string $url) {
            return (new MailMessage)
                ->subject('Verificación de Cuenta - UEB') 
                ->greeting('¡Hola ' . $notifiable->nombres . '!') 
                ->line('Has sido registrado en el Sistema de Habilidades Blandas.')
                ->line('Por favor, haz clic en el botón de abajo para activar tu cuenta.')
                ->line('Tienes 30 días para realizar esta activación.') 
                ->action('Verificar mi Correo', $url) 
                ->line('Si no creaste esta cuenta, ninguna acción es requerida.')
                ->salutation('Saludos, El Equipo de Administración');
        });
    }
}