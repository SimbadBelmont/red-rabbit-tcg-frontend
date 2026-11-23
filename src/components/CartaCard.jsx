import { useState } from 'react';
import { usePedido } from '../context/PedidoContext';
import { PRODUCTOS, etiquetaCondicion, nombreCondicion, nombreJuego } from '../services/inventarioService';
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
    const sellado = carta.tipo === 'sellado';
    const acabado = sellado ? '' : etiquetaAcabado(carta.acabado);

    const agregarElegida = () => agregar({
        _id: v._id, nombre: carta.nombre, juego: carta.juego, imagen: carta.imagen,
        precio: v.precio, stock: v.stock, condicion: v.condicion, acabado: carta.acabado, expansion: carta.expansion, tipo: carta.tipo,
    });

    return (
        <article className="tarjeta carta">
            <div className={`carta__imagen ${sellado ? 'carta__imagen--sellado' : ''}`}>
                {carta.imagen
                    ? <img src={carta.imagen} alt={carta.nombre} loading="lazy" />
                    : <IconoCartaVacia />}
                <span className="carta__juego">{sellado ? `${PRODUCTOS[carta.producto] || 'Sellado'} · ${nombreJuego(carta.juego)}` : nombreJuego(carta.juego)}</span>
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
                    <div role="radiogroup" aria-label={`${sellado ? 'Estado' : 'Condición'} de ${carta.nombre}`} className="condiciones">
                        {variantes.map((x) => (
                            <button key={x._id} type="button" role="radio" aria-checked={x._id === v._id} title={nombreCondicion(x.condicion)}
                                className={`condiciones__opcion ${x._id === v._id ? 'activo' : ''}`} onClick={() => setElegidaId(x._id)}>
                                {etiquetaCondicion(x.condicion)}
                            </button>
                        ))}
                    </div>
                ) : (
                    <span className="texto-chico texto-suave">
                        {sellado ? <>Estado: <strong>{nombreCondicion(v.condicion)}</strong></> : <>Condición: <strong title={nombreCondicion(v.condicion)}>{v.condicion}</strong> · {nombreCondicion(v.condicion)}</>}
                    </span>
                )}

                <div className="carta__precio-fila">
                    <span className="carta__precio">{mxn(v.precio)}</span>
                    <span className={`pastilla ${pocas ? 'pastilla--aviso' : 'pastilla--roja'}`}>
                        {pocas ? `Últimas ${v.stock}` : 'Disponible'}
                    </span>
                </div>
                {dentro
                    ? <button type="button" className="btn btn--rojo btn--bloque" aria-pressed="true" onClick={() => quitar(v._id)}><IconoCheck /> En tu pedido · Quitar</button>
                    : <button type="button" className="btn btn--contorno-rojo btn--bloque" onClick={agregarElegida}>{sellado ? 'Agregar al pedido' : `Agregar ${v.condicion} al pedido`}</button>}
            </div>
        </article>
    );
}
