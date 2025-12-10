<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        echo "Iniciando seeders...\n\n";

        $this->call([
            RolesAndPermissionsSeeder::class,
            NivelesSeeder::class,
            UsersSeeder::class,
        ]);

        echo "\n ¡Todos los seeders ejecutados exitosamente!\n";
        echo "\n CREDENCIALES DE ACCESO:\n";
        echo "================================\n";
        echo "Coordinador:\n";
        echo "  DNI: 00000000\n";
        echo "  Password: admin123\n\n";
        echo "Secretaria:\n";
        echo "  DNI: 11111111\n";
        echo "  Password: secret123\n\n";
        echo "Profesores:\n";
        echo "  DNI: 22222222 / 33333333\n";
        echo "  Password: profe123\n\n";
        echo "Clientes:\n";
        echo "  DNI: 40000001 a 40000008\n";
        echo "  Password: cliente123\n";
        echo "================================\n";
    }
}

