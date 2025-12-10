<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Crear permisos
        $permissions = [
            // Turnos
            'ver_turnos',
            'crear_turnos',
            'editar_turnos',
            'eliminar_turnos',
            
            // Inscripciones
            'ver_inscripciones',
            'crear_inscripciones',
            'eliminar_inscripciones',
            
            // Asistencias
            'ver_asistencias',
            'tomar_asistencias',
            'ver_asistencias_otros_profes',
            
            // Usuarios
            'ver_usuarios',
            'crear_usuarios',
            'editar_usuarios',
            'eliminar_usuarios',
            
            // Estados de cuenta
            'ver_estados_cuenta',
            'modificar_estados_cuenta',
            
            // Niveles
            'sugerir_cambio_nivel',
            'aprobar_cambio_nivel',
            
            // Notificaciones
            'enviar_notificaciones',
            
            // Reportes
            'ver_reportes',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // ============================================
        // CREAR ROLES Y ASIGNAR PERMISOS
        // ============================================

        // ROL: Coordinador - Acceso total
        $coordinador = Role::create(['name' => 'coordinador']);
        $coordinador->givePermissionTo(Permission::all());

        // ROL: Secretaría
        $secretaria = Role::create(['name' => 'secretaria']);
        $secretaria->givePermissionTo([
            'ver_turnos',
            'crear_turnos',
            'editar_turnos',
            'ver_inscripciones',
            'crear_inscripciones',
            'eliminar_inscripciones',
            'ver_asistencias',
            'ver_usuarios',
            'crear_usuarios',
            'editar_usuarios',
            'ver_estados_cuenta',
            'modificar_estados_cuenta',
            'aprobar_cambio_nivel',
            'enviar_notificaciones',
            'ver_reportes',
        ]);

        // ROL: Profesor
        $profesor = Role::create(['name' => 'profesor']);
        $profesor->givePermissionTo([
            'ver_turnos',
            'ver_inscripciones',
            'ver_asistencias',
            'tomar_asistencias',
            'ver_asistencias_otros_profes',
            'sugerir_cambio_nivel',
        ]);

        // ROL: Cliente
        $cliente = Role::create(['name' => 'cliente']);
        $cliente->givePermissionTo([
            'ver_turnos',
            'ver_inscripciones',
            'ver_estados_cuenta',
        ]);

        echo "✅ Roles y permisos creados exitosamente\n";
    }
}

