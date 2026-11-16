import { diaMes, fechaLarga, hora, mxn } from '../utils/formato';
import { IconoEnlace } from './Iconos';

export default function EventoCard({ evento, reservado, onReservar, ocupado }) {
    const { dia, mes } = diaMes(evento.fecha);
    const pct = evento.cupo ? Math.round((evento.inscritosTotal / evento.cupo) * 100) : 0;
    const lleno = evento.disponibles <= 0;

    return (
        <article className="tarjeta evento">
            <div className="evento__cabeza">
                <div className="pila-chica">
                    <span className="pastilla pastilla--roja">{evento.tipo}</span>
                    <h2 className="evento__titulo">{evento.titulo}</h2>
                    <span className="texto-suave">{evento.juego}{evento.formato ? ` · ${evento.formato}` : ''}</span>
                </div>
                <div className="fecha-caja"><strong>{dia}</strong><span>{mes}</span></div>
            </div>
            {evento.descripcion && <p className="texto-suave">{evento.descripcion}</p>}
            <div className="pila-chica texto-chico">
                <span className="capitalizar">{fechaLarga(evento.fecha)} · {hora(evento.fecha)} h</span>
                <span>{evento.lugar} - Red Rabbit Store</span>
            </div>
            {evento.wotcUrl && (
                <a className="evento__wotc" href={evento.wotcUrl} target="_blank" rel="noreferrer">
                    <IconoEnlace /> Ver en Wizards Event Locator
                </a>
            )}
            <div className="pila-chica">
                <div className="evento__cupo texto-chico">
                    <span>{evento.inscritosTotal}/{evento.cupo} lugares</span>
                    <strong>{lleno ? 'Lleno' : `${evento.disponibles} disponibles`}</strong>
                </div>
                <div className="barra"><div className="barra__relleno" style={{ width: `${pct}%` }} /></div>
            </div>
            <div className="evento__pie">
                <span className="carta__precio">{evento.cuota ? mxn(evento.cuota) : 'Gratis'}</span>
                {reservado
                    ? <button type="button" className="btn btn--contorno-rojo" disabled={ocupado} aria-pressed="true" onClick={() => onReservar(evento, false)}>Reservado · Cancelar</button>
                    : <button type="button" className="btn btn--rojo" disabled={ocupado || lleno} onClick={() => onReservar(evento, true)}>{lleno ? 'Sin lugares' : 'Reservar lugar'}</button>}
            </div>
        </article>
    );
}
