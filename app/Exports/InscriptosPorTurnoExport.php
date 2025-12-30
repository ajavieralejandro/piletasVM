<?php

namespace App\Exports;

use App\Models\Inscripcion;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class InscriptosPorTurnoExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(
        private int $turnoId,
        private bool $soloActivos = true
    ) {}

    public function query()
    {
        $q = Inscripcion::query()
            ->with(['alumno', 'turno.nivel', 'turno.profesor'])
            ->where('turno_id', $this->turnoId)
            ->orderBy('fecha_inscripcion');

        if ($this->soloActivos) {
            $q->where('estado', 'activo');
        }

        return $q;
    }

    public function headings(): array
    {
        return [
            'Apellido',
            'Nombre',
            'DNI',
            'Teléfono',
            'Email',
            'Pase libre',
            'Estado inscripción',
            'Fecha inscripción',
            'Nivel',
            'Día',
            'Hora inicio',
            'Hora fin',
            'Profesor',
        ];
    }

    public function map($inscripcion): array
    {
        $a = $inscripcion->alumno;
        $t = $inscripcion->turno;

        return [
            $a?->apellido ?? '',
            $a?->nombre ?? '',
            $a?->dni ?? '',
            $a?->telefono ?? '',
            $a?->email ?? '',
            $inscripcion->pase_libre ? 'SI' : 'NO',
            $inscripcion->estado ?? '',
            optional($inscripcion->fecha_inscripcion)->format('Y-m-d') ?? '',
            $t?->nivel?->nombre ?? '',
            $t?->dia_semana ?? '',
            optional($t?->hora_inicio)->format('H:i') ?? '',
            optional($t?->hora_fin)->format('H:i') ?? '',
            $t?->profesor?->nombre_completo ?? '',
        ];
    }
}
