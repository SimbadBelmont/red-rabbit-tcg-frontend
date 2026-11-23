import { useState } from 'react';
import { usePedido } from '../context/PedidoContext';
import { CONDICIONES, nombreJuego } from '../services/inventarioService';
import { etiquetaAcabado } from '../utils/acabados';
import { mxn } from '../utils/formato';
import { IconoCartaVacia, IconoCheck } from './Iconos';

// Una tarjeta por impresión. Si hay varias condiciones (NM, LP…) se eligen con los botones,
// cada una con su precio y stock. Acepta también una carta suelta sin "variantes".
export default function CartaCard({ carta }) {
    const { agregar, quitar, estaEnPedido } = usePedido();
    const variantes = carta.variantes?.length ? carta.variantes : [{ _id: carta._id, condicion: carta.condicion, precio: carta.precio, stock: carta.stock }];
    const [elegidaId, setElegidaId] = useState(variantes[0]._id);
    const v = variantes.find((x) => x._id === elegidaId) || variantes[0];
    const dentro = estaEnPedido(v._id);
    const pocas = v.stock <= 2;
    const acabado = etiquetaAcabado(carta.acabado);

    const agregarElegida = () => agregar({
        _id: v._id, nombre: carta.nombre, juego: carta.juego, imagen: carta.imagen,
        precio: v.precio, stock: v.stock, condicion: v.condicion, acabado: carta.acabado, expansion: carta.expansion,
    });

    return (
        <article className="tarjeta carta">
            <div className="carta__imagen">
                {carta.imagen
                    ? <img src={carta.imagen} alt={carta.nombre} loading="lazy" />
                    : <IconoCartaVacia />}
                <span className="carta__juego">{nombreJuego(carta.juego)}</span>
                {acabado && <span className={`carta__acabado carta__acabado--${carta.acabado}`}>{acabado}</span>}
            </div>
            <div className="carta__cuerpo">
                <div>
                    <h3 className="carta__nombre">{carta.nombre}</h3>
                    <span className="texto-suave texto-chico">
                        {[carta.expansion && `${carta.expansion}${carta.numero ? ` ${carta.numero}` : ''}`, carta.idioma && carta.idioma.toUpperCase()].filter(Boolean).join(' · ')}
                    </span>
                    {/* Scryfall pide dar crédito al artista donde se muestre su arte */}
                    {carta.artista && <span className="carta__credito">Ilus. {carta.artista} · Scryfall</span>}
                </div>

                {variantes.length > 1 ? (
                    <div role="radiogroup" aria-label={`Condición de ${carta.nombre}`} className="condiciones">
                        {variantes.map((x) => (
                            <button key={x._id} type="button" role="radio" aria-checked={x._id === v._id} title={CONDICIONES[x.condicion]}
                                className={`condiciones__opcion ${x._id === v._id ? 'activo' : ''}`} onClick={() => setElegidaId(x._id)}>
                                {x.condicion}
                            </button>
                        ))}
                    </div>
                ) : (
                    <span className="texto-chico texto-suave">Condición: <strong title={CONDICIONES[v.condicion]}>{v.condicion}</strong> · {CONDICIONES[v.condicion]}</span>
                )}

                <div className="carta__precio-fila">
                    <span className="carta__precio">{mxn(v.precio)}</span>
                    <span className={`pastilla ${pocas ? 'pastilla--aviso' : 'pastilla--roja'}`}>
                        {pocas ? `Últimas ${v.stock}` : 'Disponible'}
                    </span>
                </div>
                {dentro
                    ? <button type="button" className="btn btn--rojo btn--bloque" aria-pressed="true" onClick={() => quitar(v._id)}><IconoCheck /> En tu pedido · Quitar</button>
                    : <button type="button" className="btn btn--contorno-rojo btn--bloque" onClick={agregarElegida}>Agregar {v.condicion} al pedido</button>}
            </div>
        </article>
    );
}
