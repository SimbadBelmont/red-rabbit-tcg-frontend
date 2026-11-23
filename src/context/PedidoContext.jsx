import { createContext, useContext, useEffect, useState } from 'react';

// El "carrito": cartas que el cliente quiere apartar. Se guarda en el navegador.
const PedidoContext = createContext();

const leer = () => {
    try { return JSON.parse(localStorage.getItem('pedido')) || []; } catch { return []; }
};

export const PedidoProvider = ({ children }) => {
    const [items, setItems] = useState(leer);

    useEffect(() => { localStorage.setItem('pedido', JSON.stringify(items)); }, [items]);

    const agregar = (carta) => setItems((prev) => {
        const ya = prev.find((i) => i._id === carta._id);
        if (ya) return prev.map((i) => (i._id === carta._id ? { ...i, cantidad: Math.min(i.cantidad + 1, carta.stock) } : i));
        return [...prev, {
            _id: carta._id, nombre: carta.nombre, juego: carta.juego, precio: carta.precio, imagen: carta.imagen, stock: carta.stock, cantidad: 1,
            condicion: carta.condicion, acabado: carta.acabado, expansion: carta.expansion,
        }];
    });
    const cambiarCantidad = (id, cantidad) => setItems((prev) => prev
        .map((i) => (i._id === id ? { ...i, cantidad: Math.max(0, Math.min(cantidad, i.stock)) } : i))
        .filter((i) => i.cantidad > 0));
    const quitar = (id) => setItems((prev) => prev.filter((i) => i._id !== id));
    const vaciar = () => setItems([]);
    const estaEnPedido = (id) => items.some((i) => i._id === id);

    const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
    const cantidad = items.reduce((s, i) => s + i.cantidad, 0);

    return (
        <PedidoContext.Provider value={{ items, agregar, cambiarCantidad, quitar, vaciar, estaEnPedido, total, cantidad }}>
            {children}
        </PedidoContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePedido = () => useContext(PedidoContext);
