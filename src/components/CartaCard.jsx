import { usePedido } from '../context/PedidoContext';
import { CONDICIONES, nombreJuego } from '../services/inventarioService';
import { mxn } from '../utils/formato';
import { IconoCartaVacia, IconoCheck } from './Iconos';

export default function CartaCard({ carta }) {
    const { agregar, quitar, estaEnPedido } = usePedido();
    const dentro = estaEnPedido(carta._id);
    const pocas = carta.stock <= 2;

    return (
        <article className="tarjeta carta">
            <div className="carta__imagen">
                {carta.imagen
                    ? <img src={carta.imagen} alt={carta.nombre} loading="lazy" />
                    : <IconoCartaVacia />}
                <span className="carta__juego">{nombreJuego(carta.juego)}</span>
            </div>
            <div className="carta__cuerpo">
                <div>
                    <h3 className="carta__nombre">{carta.nombre}</h3>
                    <span className="texto-suave texto-chico">
                        {[carta.expansion, CONDICIONES[carta.condicion] || carta.condicion, carta.foil && 'Foil'].filter(Boolean).join(' · ')}
                    </span>
                    {/* Scryfall pide dar crédito al artista donde se muestre su arte */}
                    {carta.artista && <span className="carta__credito">Ilus. {carta.artista} · Scryfall</span>}
                </div>
                <div className="carta__precio-fila">
                    <span className="carta__precio">{mxn(carta.precio)}</span>
                    <span className={`pastilla ${pocas ? 'pastilla--aviso' : 'pastilla--roja'}`}>
                        {pocas ? `Últimas ${carta.stock}` : 'Disponible'}
                    </span>
                </div>
                {dentro
                    ? <button type="button" className="btn btn--rojo btn--bloque" aria-pressed="true" onClick={() => quitar(carta._id)}><IconoCheck /> En tu pedido · Quitar</button>
                    : <button type="button" className="btn btn--contorno-rojo btn--bloque" onClick={() => agregar(carta)}>Agregar al pedido</button>}
            </div>
        </article>
    );
}
