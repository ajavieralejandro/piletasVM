<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #1a4d3e 0%, #2d6a57 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .info-box {
            background: white;
            border-left: 4px solid #1a4d3e;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-row {
            margin: 10px 0;
        }
        .label {
            font-weight: bold;
            color: #1a4d3e;
        }
        .highlight {
            background: #e6f7f4;
            padding: 2px 8px;
            border-radius: 3px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">🏊 Nueva Inscripción</h1>
        <p style="margin: 10px 0 0 0;">Club Villa Mitre - Natación</p>
    </div>
    
    <div class="content">
        <p>Hola,</p>
        
        <p>Te informamos que un alumno se ha inscripto en uno de tus turnos:</p>
        
        <div class="info-box">
            <div class="info-row">
                <span class="label">👤 Alumno:</span> 
                <span class="highlight">{{ $alumno->nombre_completo }}</span>
            </div>
            <div class="info-row">
                <span class="label">📋 DNI:</span> {{ $alumno->dni }}
            </div>
            @if($alumno->email)
            <div class="info-row">
                <span class="label">📧 Email:</span> {{ $alumno->email }}
            </div>
            @endif
            @if($alumno->telefono)
            <div class="info-row">
                <span class="label">📞 Teléfono:</span> {{ $alumno->telefono }}
            </div>
            @endif
        </div>

        <div class="info-box">
            <div class="info-row">
                <span class="label">📅 Día:</span> 
                <span class="highlight">{{ ucfirst($turno->dia_semana) }}</span>
            </div>
            <div class="info-row">
                <span class="label">⏰ Horario:</span> 
                {{ $turno->hora_inicio }} - {{ $turno->hora_fin }}
            </div>
            @if($turno->nivel)
            <div class="info-row">
                <span class="label">🏊 Nivel:</span> {{ $turno->nivel->nombre }}
            </div>
            @endif
            <div class="info-row">
                <span class="label">👥 Cupo:</span> 
                {{ $turno->cupo_maximo - $turno->cupo_disponible + 1 }} / {{ $turno->cupo_maximo }}
            </div>
        </div>

        <p style="margin-top: 30px;">
            <strong>Fecha de inscripción:</strong> {{ $inscripcion->created_at->format('d/m/Y H:i') }}
        </p>

        <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Podés ver más detalles en tu panel de profesor.
        </p>
    </div>

    <div class="footer">
        <p>Este es un mensaje automático del sistema de gestión de Club Villa Mitre.</p>
        <p>Por favor, no respondas a este correo.</p>
    </div>
</body>
</html>
