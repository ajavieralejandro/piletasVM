<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\TurnoExportController;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RegistroController;
use App\Http\Controllers\Api\RecuperacionController;
use App\Http\Controllers\Api\TurnoController;
use App\Http\Controllers\Api\InscripcionController;
use App\Http\Controllers\Api\AlumnoController;
use App\Http\Controllers\Api\ProfesorController;
use App\Http\Controllers\Api\ProfesorDashboardController;
use App\Http\Controllers\Api\NivelController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\GestionController;
use App\Http\Controllers\Api\MensajeriaController;
use App\Http\Controllers\Api\NotificacionesController;
use App\Http\Controllers\Admin\PiletaController;
use App\Http\Controllers\Api\PerfilController;

// =======================
// RUTAS PÚBLICAS
// =======================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/registro', [RegistroController::class, 'registrar']);
Route::post('/recuperar-password/verificar', [RecuperacionController::class, 'verificarUsuario']);
Route::post('/recuperar-password/cambiar', [RecuperacionController::class, 'cambiarPassword']);

// =======================
// RUTAS PROTEGIDAS
// =======================
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // PERFIL (una sola vez)
    Route::get('/perfil', [PerfilController::class, 'show']);
    Route::put('/perfil', [PerfilController::class, 'update']);
    Route::post('/perfil/foto', [PerfilController::class, 'subirFoto']);
    Route::delete('/perfil/foto', [PerfilController::class, 'eliminarFoto']);

    // TURNOS
    Route::apiResource('turnos', TurnoController::class);
    Route::get('/turnos/{id}/inscripciones', [TurnoController::class, 'inscripciones']);
    Route::get('/turnos/{turno}/inscriptos/excel', [TurnoExportController::class, 'inscriptosExcel'])
    ->name('api.turnos.inscriptos.excel');

    // Clases (Modelo A)
    Route::get('/turnos/{id}/clases', [TurnoController::class, 'clases']);
    Route::post('/turnos/{id}/generar-clases', [TurnoController::class, 'generarClases']);

    // INSCRIPCIONES
    Route::post('/inscripciones', [InscripcionController::class, 'store']);
    Route::delete('/inscripciones/{id}', [InscripcionController::class, 'destroy']);

    // Si tu frontend usa esta ruta vieja, dejala:
    // Route::get('/turnos/{turnoId}/inscripciones', [InscripcionController::class, 'getPorTurno']);

    // PILETAS
    Route::apiResource('piletas', PiletaController::class);

    // ALUMNOS
    Route::apiResource('alumnos', AlumnoController::class);
    Route::get('/alumnos/inasistentes', [AlumnoController::class, 'inasistentes']);

    // PROFESORES
    Route::apiResource('profesores', ProfesorController::class);

    // NIVELES
    Route::apiResource('niveles', NivelController::class);

    // GESTION
    Route::prefix('gestion')->group(function () {
        Route::put('/usuarios/{id}/estado', [GestionController::class, 'cambiarEstadoUsuario']);
        Route::put('/usuarios/{id}/tipo-cliente', [GestionController::class, 'cambiarTipoCliente']);

        Route::post('/cuotas', [GestionController::class, 'crearCuota']);
        Route::get('/cuotas', [GestionController::class, 'listarCuotas']);
        Route::put('/cuotas/{id}/pagar', [GestionController::class, 'marcarCuotaPagada']);
        Route::post('/cuotas/{id}/recordatorio', [GestionController::class, 'enviarRecordatorio']);
        Route::get('/cuotas/estadisticas', [GestionController::class, 'estadisticasCuotas']);

        Route::get('/usuarios-pendientes', [RegistroController::class, 'usuariosPendientes']);
        Route::put('/usuarios/{id}/aprobar', [RegistroController::class, 'aprobarUsuario']);
        Route::delete('/usuarios/{id}/rechazar', [RegistroController::class, 'rechazarUsuario']);
    });

    // PROFESOR
    Route::prefix('profesor')->group(function () {
        Route::get('/mis-turnos', [ProfesorDashboardController::class, 'misTurnos']);
        Route::get('/turnos/{turnoId}/alumnos', [ProfesorDashboardController::class, 'alumnosTurno']);
        Route::get('/turnos/{turnoId}/asistencias', [ProfesorDashboardController::class, 'asistenciasTurno']);
        Route::post('/asistencias', [ProfesorDashboardController::class, 'registrarAsistencia']);
        Route::post('/asistencias/masivas', [ProfesorDashboardController::class, 'registrarAsistenciasMasivas']);
    });

    // CLIENTE
    Route::prefix('cliente')->group(function () {
        Route::post('/inscribirse', [ClienteController::class, 'inscribirse']);
        Route::get('/mis-inscripciones', [ClienteController::class, 'misInscripciones']);
        Route::get('/mis-asistencias', [ClienteController::class, 'misAsistencias']);
        Route::get('/mi-perfil', [ClienteController::class, 'miPerfil']);
        Route::put('/mi-perfil', [ClienteController::class, 'actualizarPerfil']);
    });

    // MENSAJES
    Route::prefix('mensajes')->group(function () {
        Route::get('/', [MensajeriaController::class, 'misConversaciones']);
        Route::get('/conversacion/{interlocutorId}', [MensajeriaController::class, 'obtenerConversacion']);
        Route::post('/enviar', [MensajeriaController::class, 'enviarMensaje']);
        Route::post('/enviar-grupal', [MensajeriaController::class, 'enviarMensajeGrupal']);
        Route::get('/no-leidos', [MensajeriaController::class, 'contarNoLeidos']);
        Route::put('/{id}/leido', [MensajeriaController::class, 'marcarComoLeido']);
        Route::get('/profesores', [MensajeriaController::class, 'listarProfesores']);
        Route::get('/alumnos-turno/{turnoId}', [MensajeriaController::class, 'listarAlumnosTurno']);
    });

    // NOTIFICACIONES
    Route::prefix('notificaciones')->group(function () {
        Route::get('/', [NotificacionesController::class, 'misNotificaciones']);
        Route::get('/no-leidas', [NotificacionesController::class, 'contarNoLeidas']);
        Route::put('/{id}/leida', [NotificacionesController::class, 'marcarComoLeida']);
        Route::put('/marcar-todas-leidas', [NotificacionesController::class, 'marcarTodasLeidas']);
        Route::delete('/{id}', [NotificacionesController::class, 'eliminar']);
        Route::delete('/limpiar-leidas', [NotificacionesController::class, 'limpiarLeidas']);
    });
});

