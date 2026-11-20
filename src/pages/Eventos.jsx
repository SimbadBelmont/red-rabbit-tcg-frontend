import { useEffect, useState } from 'react';
import EventoCard from '../components/EventoCard';
import { TIPOS, WIZARDS_LOCATOR, cancelarReserva, misEventos, proximos, reservar } from '../services/eventoService';
import { useAuth } from '../context/AuthContext';

export default function Eventos() {
    const { user, abrirAcceso } = useAuth();
    const [tipo, setTipo] = useState('');
    const [eventos, setEventos] = useState([]);
    const [mios, setMios] = useState(new Set());
    const [ocupado, setOcupado] = useState(null);
    const [mensaje, setMensaje] = useState(null);

    const cargar = () => proximos(tipo).then(setEventos).catch((e) => setMensaje({ tipo: 'error', texto: e.message }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cargar(); }, [tipo]);
    useEffect(() => {
        if (user) misEventos().then((e) => setMios(new Set(e.map((x) => x._id)))).catch(() => {});
    }, [user]);

    const onReservar = async (evento, apartar) => {
        if (!user) return abrirAcceso('login'); // al entrar se queda en Eventos
        setOcupado(evento._id);
        try {
            if (apartar) await reservar(evento._id); else await cancelarReserva(evento._id);
            setMios((prev) => {
                const s = new Set(prev);
                if (apartar) s.add(evento._id); else s.delete(evento._id);
                return s;
            });
            setMensaje({ tipo: 'ok', texto: apartar ? `¡Listo! Tienes lugar en ${evento.titulo}.` : 'Cancelaste tu reserva.' });
            await cargar();
        } catch (e) {
            setMensaje({ tipo: 'error', texto: e.message });
        } finally {
            setOcupado(null);
        }
    };

    return (
        <div className="contenedor pagina">
            <div className="encabezado-pagina">
                <div className="pila-chica">
                    <h1 className="titulo-pagina">Tablón de eventos</h1>
                    <p className="texto-suave texto-grande">Torneos, prereleases y reuniones en Red Rabbit TCG Store. Reserva tu lugar.</p>
                </div>
                <div className="fila-botones">
                    <a href={WIZARDS_LOCATOR} target="_blank" rel="noreferrer" className="btn btn--contorno">Vernos en Wizards Event Locator</a>
                    <a href="/contacto" className="btn btn--rojo">Proponer un evento</a>
                </div>
            </div>

            <div role="group" aria-label="Filtrar por tipo" className="fila-botones">
                {['', ...TIPOS].map((t) => (
                    <button key={t || 'todos'} type="button" aria-pressed={tipo === t}
                        className={`chip ${tipo === t ? 'activo' : ''}`} onClick={() => setTipo(t)}>{t || 'Todos'}</button>
                ))}
            </div>

            {mensaje && <p className={`alerta ${mensaje.tipo === 'ok' ? 'alerta--ok' : 'alerta--error'}`} role="status">{mensaje.texto}</p>}

            <div className="rejilla rejilla--340">
                {eventos.map((e) => (
                    <EventoCard key={e._id} evento={e} reservado={mios.has(e._id)} ocupado={ocupado === e._id} onReservar={onReservar} />
                ))}
            </div>
            {eventos.length === 0 && <p className="texto-suave">No hay eventos programados por ahora.</p>}
        </div>
    );
}
