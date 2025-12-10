# 🏊 Sistema de Gestión de Pileta - Villa Mitre

## 📚 GUÍA DE INSTALACIÓN PASO A PASO

### ✅ PASO 1: Verificar Requisitos

Antes de empezar, asegurate de tener instalado:

1. **Node.js** (versión 18 o superior)
   - Descargalo de: https://nodejs.org/
   - Para verificar: abrí una terminal y escribí `node -v`

2. **npm** (viene con Node.js)
   - Para verificar: `npm -v`

3. **Laravel Backend** funcionando en http://localhost:8000

---

### 📦 PASO 2: Instalar el Frontend

#### 2.1 - Extraer archivos
1. Descomprimí la carpeta `vmpileta-frontend` en tu computadora
2. Abrí una terminal/consola en esa carpeta

#### 2.2 - Instalar dependencias
En la terminal, escribí:

```bash
npm install
```

Esto va a descargar todas las librerías necesarias (React, Tailwind, etc).
**IMPORTANTE:** Este paso puede tardar varios minutos. ¡Esperá a que termine!

---

### 🚀 PASO 3: Configurar Backend Laravel

Necesitás agregar las rutas API que faltan en tu Laravel.

#### 3.1 - Archivo `routes/api.php`

Reemplazá el contenido de `routes/api.php` con:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TurnoController;
use App\Http\Controllers\Api\InscripcionController;
use App\Http\Controllers\Api\AlumnoController;

// RUTAS PÚBLICAS
Route::post('/login', [AuthController::class, 'login']);

// RUTAS PROTEGIDAS
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Turnos
    Route::get('/turnos', [TurnoController::class, 'index']);
    Route::get('/turnos/{id}', [TurnoController::class, 'show']);
    Route::get('/turnos/{id}/inscripciones', [TurnoController::class, 'inscripciones']);
    
    // Inscripciones
    Route::post('/inscripciones', [InscripcionController::class, 'store']);
    Route::delete('/inscripciones/{id}', [InscripcionController::class, 'destroy']);
    
    // Alumnos
    Route::post('/alumnos', [AlumnoController::class, 'store']);
    Route::get('/alumnos', [AlumnoController::class, 'index']);
    Route::get('/alumnos/inasistentes', [AlumnoController::class, 'inasistentes']);
    
});
```

---

### 🎯 PASO 4: Iniciar el Frontend

En la terminal (dentro de la carpeta `vmpileta-frontend`), escribí:

```bash
npm run dev
```

Deberías ver algo como:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

### 🔐 PASO 5: Probar el Sistema

1. Abrí tu navegador en: **http://localhost:3000**

2. **Crear un usuario de prueba** en Laravel:
   
   Abrí una terminal en tu proyecto Laravel y ejecutá:
   
   ```bash
   php artisan tinker
   ```
   
   Luego escribí:
   
   ```php
   $user = new \App\Models\User();
   $user->nombre = 'María';
   $user->apellido = 'González';
   $user->dni = '12345678';
   $user->telefono = '2914567890';
   $user->email = 'secretaria@villamitre.com';
   $user->password = bcrypt('123456');
   $user->tipo_usuario = 'secretaria';
   $user->activo = true;
   $user->save();
   ```
   
   Presioná `Ctrl+C` para salir de tinker.

3. **Iniciar sesión:**
   - DNI: `12345678`
   - Contraseña: `123456`

---

### 📱 ESTRUCTURA DEL PROYECTO

```
vmpileta-frontend/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Layout.jsx       # Navbar y estructura general
│   │   └── dashboards/      # Dashboards por rol
│   │       ├── SecretariaDashboard.jsx
│   │       ├── ProfesorDashboard.jsx
│   │       ├── ClienteDashboard.jsx
│   │       └── CoordinadorDashboard.jsx
│   ├── pages/               # Páginas principales
│   │   ├── LoginPage.jsx
│   │   └── DashboardPage.jsx
│   ├── services/            # Servicios API
│   │   └── api.js
│   ├── stores/              # Estado global (Zustand)
│   │   └── useAuthStore.js
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

### 🎨 FUNCIONALIDADES IMPLEMENTADAS

#### ✅ Sistema de Login
- Autenticación con DNI y contraseña
- Manejo de sesiones con tokens
- Logout seguro

#### ✅ Panel de Secretaría
- Selector de días (individual o por estructura)
- Vista de turnos con cupos en tiempo real
- Inscripción de alumnos
- Ver listado de inscriptos
- Dar de baja alumnos
- Alerta de inasistentes

#### 🚧 En Desarrollo
- Dashboard de Profesor
- Dashboard de Cliente
- Dashboard de Coordinador
- Toma de asistencia
- Cambios de nivel
- Pases libre diarios
- Estado de cuenta
- Notificaciones

---

### 🐛 SOLUCIÓN DE PROBLEMAS

#### Error: "Cannot GET /api/..."
- Verificá que Laravel esté corriendo en http://localhost:8000
- Ejecutá `php artisan serve` en la carpeta de Laravel

#### Error: "Network Error"
- Verificá que el backend Laravel esté iniciado
- Revisá que el archivo `.env` de Laravel tenga las credenciales correctas de base de datos

#### Error al instalar dependencias
- Eliminá la carpeta `node_modules`
- Eliminá el archivo `package-lock.json`
- Ejecutá `npm install` nuevamente

#### La página está en blanco
- Abrí las herramientas de desarrollador (F12)
- Revisá la consola para ver errores
- Verificá que todos los archivos se hayan extraído correctamente

---

### 📞 PRÓXIMOS PASOS

1. **Completar Controladores Laravel** - Necesitás los controladores que procesen las peticiones
2. **Dashboard de Profesor** - Toma de asistencia y gestión de turnos
3. **Dashboard de Cliente** - Ver horarios, estado de cuenta, pases libre
4. **App Móvil React Native** - Versión para celular

---

### 💡 TIPS

- Dejá siempre ambas terminales abiertas (Laravel y React)
- Laravel debe correr en puerto 8000
- React debe correr en puerto 3000
- No cierres las terminales mientras uses el sistema

---

### 📧 SOPORTE

Si tenés problemas:
1. Revisá que Laravel esté funcionando: http://localhost:8000
2. Revisá que React esté funcionando: http://localhost:3000
3. Revisá la consola del navegador (F12) para ver errores
4. Revisá la terminal para ver mensajes de error

---

## 🎉 ¡Listo!

El frontend está configurado y listo para usar. Seguí con los próximos pasos para completar las funcionalidades restantes.
