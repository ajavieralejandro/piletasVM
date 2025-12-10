<?php


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================
        // 1. COORDINADOR
        // ============================================
        $coordinador = User::create([
            'nombre' => 'Admin',
            'apellido' => 'Sistema',
            'dni' => '00000000',
            'telefono' => '2914000000',
            'email' => 'admin@pileta.com',
            'password' => Hash::make('admin123'),
            'tipo_usuario' => 'coordinador',
            'activo' => true,
        ]);
        $coordinador->assignRole('coordinador');
        echo "✅ Coordinador creado - DNI: 00000000 / Pass: admin123\n";

        // ============================================
        // 2. SECRETARÍA
        // ============================================
        $secretaria = User::create([
            'nombre' => 'María',
            'apellido' => 'González',
            'dni' => '11111111',
            'telefono' => '2914111111',
            'email' => 'secretaria@pileta.com',
            'password' => Hash::make('secret123'),
            'tipo_usuario' => 'secretaria',
            'activo' => true,
        ]);
        $secretaria->assignRole('secretaria');
        echo "✅ Secretaria creada - DNI: 11111111 / Pass: secret123\n";

        // ============================================
        // 3. PROFESORES
        // ============================================
        $profesores = [
            [
                'nombre' => 'Juan',
                'apellido' => 'Pérez',
                'dni' => '22222222',
                'telefono' => '2914222222',
                'email' => 'juan@pileta.com',
            ],
            [
                'nombre' => 'Ana',
                'apellido' => 'Martínez',
                'dni' => '33333333',
                'telefono' => '2914333333',
                'email' => 'ana@pileta.com',
            ],
        ];

        foreach ($profesores as $profData) {
            $profesor = User::create([
                ...$profData,
                'password' => Hash::make('profe123'),
                'tipo_usuario' => 'profesor',
                'activo' => true,
            ]);
            $profesor->assignRole('profesor');
            echo "✅ Profesor creado - DNI: {$profData['dni']} / Pass: profe123\n";
        }

        // ============================================
        // 4. CLIENTES (imagen)
        // ============================================
        $clientes = [
            ['nombre' => 'Ailen', 'apellido' => 'Lescano', 'dni' => '40000001', 'tipo_cliente' => 'normal'],
            ['nombre' => 'Alan', 'apellido' => 'Martinez', 'dni' => '40000002', 'tipo_cliente' => 'normal'],
            ['nombre' => 'Alexis', 'apellido' => 'Graff', 'dni' => '40000003', 'tipo_cliente' => 'pase_libre'],
            ['nombre' => 'Ariel', 'apellido' => 'Armando Deluster', 'dni' => '40000004', 'tipo_cliente' => 'normal'],
            ['nombre' => 'Claudio', 'apellido' => 'Adrian Polito', 'dni' => '40000005', 'tipo_cliente' => 'normal'],
            ['nombre' => 'Cristian', 'apellido' => 'Obredor', 'dni' => '40000006', 'tipo_cliente' => 'pase_libre'],
            ['nombre' => 'Dario', 'apellido' => 'Antonio Diaz', 'dni' => '40000007', 'tipo_cliente' => 'normal'],
            ['nombre' => 'Fabian', 'apellido' => 'Llanos', 'dni' => '40000008', 'tipo_cliente' => 'normal'],
        ];

        foreach ($clientes as $clienteData) {
            $cliente = User::create([
                ...$clienteData,
                'telefono' => '291' . rand(4000000, 4999999),
                'email' => null,
                'password' => Hash::make('cliente123'),
                'tipo_usuario' => 'cliente',
                'activo' => true,
            ]);
            $cliente->assignRole('cliente');
        }
        echo "✅ 8 Clientes creados - Pass para todos: cliente123\n";
    }
}

