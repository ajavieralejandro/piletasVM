import { Check } from 'lucide-react';
import useThemeStore from '../../../stores/useThemeStore';

const DIAS_SEMANA = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const ESTRUCTURAS = [
  { label: 'L-M-V', dias: ['lunes', 'miercoles', 'viernes'] },
  { label: 'M-J', dias: ['martes', 'jueves'] },
  { label: 'Toda la semana', dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] },
  { label: 'L-M-M-J-V', dias: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'] },
];

export default function SelectorDias({ diasSeleccionados, setDiasSeleccionados }) {
  const theme = useThemeStore((state) => state.theme);
  const isDark = theme === 'dark';

  const toggleDia = (dia) => {
    if (diasSeleccionados.includes(dia)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== dia));
    } else {
      setDiasSeleccionados([...diasSeleccionados, dia]);
    }
  };

  const seleccionarEstructura = (dias) => {
    setDiasSeleccionados(dias);
  };

  return (
    <div className={`rounded-lg shadow p-6 ${
      isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        Seleccionar Días
      </h3>

      {/* Estructuras predefinidas */}
      <div className="mb-6">
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Estructuras rápidas:
        </p>
        <div className="flex flex-wrap gap-2">
          {ESTRUCTURAS.map(estructura => (
            <button
              key={estructura.label}
              onClick={() => seleccionarEstructura(estructura.dias)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isDark
                  ? 'bg-primary-900 hover:bg-primary-800 text-primary-300'
                  : 'bg-primary-100 hover:bg-primary-200 text-primary-700'
              }`}
            >
              {estructura.label}
            </button>
          ))}
        </div>
      </div>

      {/* Días individuales */}
      <div>
        <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          O seleccioná días individuales:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DIAS_SEMANA.map(dia => {
            const estaSeleccionado = diasSeleccionados.includes(dia.value);
            return (
              <button
                key={dia.value}
                onClick={() => toggleDia(dia.value)}
                className={`
                  relative px-4 py-3 rounded-lg font-medium transition
                  ${estaSeleccionado
                    ? 'bg-primary-600 text-white shadow-lg'
                    : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                {dia.label}
                {estaSeleccionado && (
                  <Check className="absolute top-1 right-1" size={16} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Días seleccionados */}
      {diasSeleccionados.length > 0 && (
        <div className={`mt-4 p-4 rounded-lg ${
          isDark ? 'bg-primary-900/30' : 'bg-primary-50'
        }`}>
          <p className={`text-sm font-medium ${
            isDark ? 'text-primary-400' : 'text-primary-800'
          }`}>
            {diasSeleccionados.length} día{diasSeleccionados.length !== 1 ? 's' : ''} seleccionado{diasSeleccionados.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
