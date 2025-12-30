<?php

namespace App\Http\Controllers\Admin;

use App\Exports\InscriptosPorTurnoExport;
use App\Http\Controllers\Controller;
use App\Models\Turno;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class TurnoExportController extends Controller
{
    public function inscriptosExcel(Request $request, Turno $turno)
    {
        $soloActivos = $request->boolean('solo_activos', true);

        $dia  = $turno->dia_semana;
        $hora = optional($turno->hora_inicio)->format('Hi') ?? '0000';

        $filename = "turno_{$turno->id}_{$dia}_{$hora}_inscriptos.xlsx";

        return Excel::download(new InscriptosPorTurnoExport($turno->id, $soloActivos), $filename);
    }
}
