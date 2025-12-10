<?php

namespace App\Mail;

use App\Models\Inscripcion;
use App\Models\Turno;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevaInscripcionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $alumno;
    public $turno;
    public $inscripcion;

    public function __construct(User $alumno, Turno $turno, Inscripcion $inscripcion)
    {
        $this->alumno = $alumno;
        $this->turno = $turno;
        $this->inscripcion = $inscripcion;
    }

    public function build()
    {
        return $this->subject('Nueva inscripción en tu turno - Club Villa Mitre')
                    ->view('emails.nueva-inscripcion');
    }
}
