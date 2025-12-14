<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Controladores
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EstudianteController;
use App\Http\Controllers\Api\HabilidadBlandaController;
use App\Http\Controllers\Api\AsignaturaController;
use App\Http\Controllers\Api\AsignacionController;
use App\Http\Controllers\Api\DocenteController;
use App\Http\Controllers\Api\PlanificacionController; // Asegúrate de tener este
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\DashboardController;

// 1. LOGIN (Público)
Route::post('/login', [AuthController::class, 'login']);

// 2. RUTAS PROTEGIDAS (Requieren Token)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) { return $request->user(); });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);

    // --- ADMINISTRADOR ---
    Route::apiResource('/users', UserController::class);
    Route::post('/users/import', [UserController::class, 'import']);
    
    Route::apiResource('/estudiantes', EstudianteController::class);
    Route::post('/estudiantes/import', [EstudianteController::class, 'import']);
    
    Route::apiResource('/habilidades', HabilidadBlandaController::class);
    Route::post('/habilidades/import', [HabilidadBlandaController::class, 'import']);
    
    Route::apiResource('/asignaturas', AsignaturaController::class);
    Route::post('/asignaturas/import', [AsignaturaController::class, 'import']);

    // --- COORDINADOR ---
    Route::get('/asignaciones/auxiliares', [AsignacionController::class, 'datosAuxiliares']);
    Route::apiResource('/asignaciones', AsignacionController::class);

    // --- DOCENTE (Aquí estaba el fallo, ahora están protegidas) ---
    Route::get('/docente/asignaturas', [DocenteController::class, 'misAsignaturas']);
    Route::get('/docente/estudiantes/{asignatura}', [DocenteController::class, 'verEstudiantes']);
    Route::get('/docente/habilidades/{asignatura}', [DocenteController::class, 'misHabilidades']);


    

    // Planificación (Guardar la habilidad seleccionada)
    Route::post('/planificaciones', [PlanificacionController::class, 'store']);
    
    // Evaluación
    Route::post('/docente/rubrica', [DocenteController::class, 'obtenerRubrica']);
    Route::post('/docente/guardar-notas', [DocenteController::class, 'guardarNotas']);

    // Reportes
    Route::post('/reportes/generar', [ReporteController::class, 'generar']);
    Route::post('/reportes/guardar', [ReporteController::class, 'guardar']);
    Route::post('/reportes/pdf-data', [ReporteController::class, 'datosParaPdf']);
    Route::get('/reportes/general', [ReporteController::class, 'reporteGeneral']);
});