<?php

namespace App\Mail;

use App\Models\Turno;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BajaTurnoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $alumno;
    public $turno;

    public function __construct(User $alumno, Turno $turno)
    {
        $this->alumno = $alumno;
        $this->turno = $turno;
    }

    public function build()
    {
        return $this->subject('Baja de turno - Club Villa Mitre')
                    ->view('emails.baja-turno');
    }
}
