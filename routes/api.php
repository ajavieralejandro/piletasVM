<?php

use Illuminate\Support\Facades\Route;

// Controladores
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
use App\Http\Controllers\Api\PiletaController;


// ============================================
// RUTAS PÚBLICAS
// ============================================

Route::post('/login', [AuthController::class, 'login']);
Route::post('/registro', [RegistroController::class, 'registrar']);
Route::post('/recuperar-password/verificar', [RecuperacionController::class, 'verificarUsuario']);
Route::post('/recuperar-password/cambiar', [RecuperacionController::class, 'cambiarPassword']);

// ============================================
// RUTAS PROTEGIDAS
// ============================================

Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // ============================================
    // TURNOS
    // ============================================
    Route::apiResource('turnos', TurnoController::class);
    Route::get('/turnos/{id}/inscripciones', [TurnoController::class, 'inscripciones']);

    // ============================================
    // INSCRIPCIONES (ADMIN / PROFESOR)
    // ============================================
    Route::post('/inscripciones', [InscripcionController::class, 'store']);
    Route::delete('/inscripciones/{id}', [InscripcionController::class, 'destroy']);
    Route::get('/turnos/{turnoId}/inscripciones', [InscripcionController::class, 'getPorTurno']);

    // ============================================
// PILETAS (ADMIN)
// ============================================
Route::apiResource('piletas', PiletaController::class);

    // ============================================
    // ALUMNOS
    // ============================================
    Route::apiResource('alumnos', AlumnoController::class);
    Route::get('/alumnos/inasistentes', [AlumnoController::class, 'inasistentes']);

    // ============================================
    // PROFESORES (ADMIN)
    // ============================================
    Route::apiResource('profesores', ProfesorController::class);

    // ============================================
    // NIVELES (ADMIN)
    // ============================================
    Route::apiResource('niveles', NivelController::class);

    // ============================================
    // GESTIÓN ADMINISTRATIVA (ADMIN / SECRETARIA)
    // ============================================
    Route::prefix('gestion')->group(function () {

        // Estados de usuario
        Route::put('/usuarios/{id}/estado', [GestionController::class, 'cambiarEstadoUsuario']);
        Route::put('/usuarios/{id}/tipo-cliente', [GestionController::class, 'cambiarTipoCliente']);

        // Cuotas
        Route::post('/cuotas', [GestionController::class, 'crearCuota']);
        Route::get('/cuotas', [GestionController::class, 'listarCuotas']);
        Route::put('/cuotas/{id}/pagar', [GestionController::class, 'marcarCuotaPagada']);
        Route::post('/cuotas/{id}/recordatorio', [GestionController::class, 'enviarRecordatorio']);
        Route::get('/cuotas/estadisticas', [GestionController::class, 'estadisticasCuotas']);
        
        // Usuarios pendientes
        Route::get('/usuarios-pendientes', [App\Http\Controllers\Api\RegistroController::class, 'usuariosPendientes']);
        Route::put('/usuarios/{id}/aprobar', [App\Http\Controllers\Api\RegistroController::class, 'aprobarUsuario']);
        Route::delete('/usuarios/{id}/rechazar', [App\Http\Controllers\Api\RegistroController::class, 'rechazarUsuario']);

	// Rutas de perfil (todos los usuarios autenticados)
	Route::get('/perfil', [App\Http\Controllers\Api\PerfilController::class, 'show']);
	Route::put('/perfil', [App\Http\Controllers\Api\PerfilController::class, 'update']);
	Route::post('/perfil/foto', [App\Http\Controllers\Api\PerfilController::class, 'subirFoto']);
	Route::delete('/perfil/foto', [App\Http\Controllers\Api\PerfilController::class, 'eliminarFoto']);

    });  

    // ============================================
    // PROFESOR - PANEL
    // ============================================
    Route::prefix('profesor')->group(function () {
        Route::get('/mis-turnos', [ProfesorDashboardController::class, 'misTurnos']);
        Route::get('/turnos/{turnoId}/alumnos', [ProfesorDashboardController::class, 'alumnosTurno']);
        Route::get('/turnos/{turnoId}/asistencias', [ProfesorDashboardController::class, 'asistenciasTurno']);
        Route::post('/asistencias', [ProfesorDashboardController::class, 'registrarAsistencia']);
        Route::post('/asistencias/masivas', [ProfesorDashboardController::class, 'registrarAsistenciasMasivas']);
    });

    // ============================================
    // CLIENTE
    // ============================================
    Route::prefix('cliente')->group(function () {

        // Inscripción CON VALIDACIÓN de duplicados
        Route::post('/inscribirse', [ClienteController::class, 'inscribirse']);

        Route::get('/mis-inscripciones', [ClienteController::class, 'misInscripciones']);
        Route::get('/mis-asistencias', [ClienteController::class, 'misAsistencias']);
        Route::get('/mi-perfil', [ClienteController::class, 'miPerfil']);
        Route::put('/mi-perfil', [ClienteController::class, 'actualizarPerfil']);
    });

    // ============================================
    // MENSAJERÍA
    // ============================================
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

    // ============================================
    // NOTIFICACIONES
    // ============================================
    Route::prefix('notificaciones')->group(function () {
        Route::get('/', [NotificacionesController::class, 'misNotificaciones']);
        Route::get('/no-leidas', [NotificacionesController::class, 'contarNoLeidas']);
        Route::put('/{id}/leida', [NotificacionesController::class, 'marcarComoLeida']);
        Route::put('/marcar-todas-leidas', [NotificacionesController::class, 'marcarTodasLeidas']);
        Route::delete('/{id}', [NotificacionesController::class, 'eliminar']);
        Route::delete('/limpiar-leidas', [NotificacionesController::class, 'limpiarLeidas']);
    });
	// Rutas de perfil (todos los usuarios autenticados)
	Route::get('/perfil', [App\Http\Controllers\Api\PerfilController::class, 'show']);
	Route::put('/perfil', [App\Http\Controllers\Api\PerfilController::class, 'update']);
	Route::post('/perfil/foto', [App\Http\Controllers\Api\PerfilController::class, 'subirFoto']);
	Route::delete('/perfil/foto', [App\Http\Controllers\Api\PerfilController::class, 'eliminarFoto']);

});
