<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recordatorio de Cuota</title>
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
            background: linear-gradient(135deg, #00A651 0%, #00853F 100%);
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
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #00A651;
            border-radius: 5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background: #00A651;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Club Villa Mitre</h1>
        <p>Sistema de Gestión de Pileta</p>
    </div>
    
    <div class="content">
        <h2>Recordatorio de Vencimiento de Cuota</h2>
        
        <p>Hola <strong>{{ $cuota->alumno->nombre_completo }}</strong>,</p>
        
        <p>Te recordamos que tu cuota está próxima a vencer o ya se encuentra vencida.</p>
        
        <div class="info-box">
            <div class="info-row">
                <span class="label">Monto:</span>
                <span class="value">${{ number_format($cuota->monto, 2, ',', '.') }}</span>
            </div>
            <div class="info-row">
                <span class="label">Fecha de Vencimiento:</span>
                <span class="value">{{ $cuota->fecha_vencimiento->format('d/m/Y') }}</span>
            </div>
            @if($cuota->fecha_vencimiento->isPast())
            <div class="info-row">
                <span class="label" style="color: #d32f2f;">Estado:</span>
                <span class="value" style="color: #d32f2f; font-weight: bold;">VENCIDA</span>
            </div>
            @else
            <div class="info-row">
                <span class="label" style="color: #ff9800;">Días para vencer:</span>
                <span class="value" style="color: #ff9800; font-weight: bold;">
                    {{ $cuota->fecha_vencimiento->diffInDays(now()) }} días
                </span>
            </div>
            @endif
        </div>
        
        <p>Por favor, acercate a secretaría para regularizar tu situación.</p>
        
        <p><strong>Horarios de atención:</strong><br>
        Lunes a Viernes: 9:00 a 13:00 y 17:00 a 21:00<br>
        Sábados: 9:00 a 13:00</p>
    </div>
    
    <div class="footer">
        <p>Este es un mensaje automático, por favor no responder.</p>
        <p>Club Villa Mitre - Bahía Blanca<br>
        Sistema de Gestión de Pileta</p>
    </div>
</body>
</html>
