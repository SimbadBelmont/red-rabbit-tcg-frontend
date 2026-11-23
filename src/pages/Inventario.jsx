import { useSearchParams } from 'react-router-dom';
import SubirInventario from '../components/inventario/SubirInventario';
import GestionarCartas from '../components/inventario/GestionarCartas';

const VISTAS = [['gestionar', 'Gestionar cartas'], ['subir', 'Subir inventario']];

// Solo staff/admin. La pestaña va en la URL (?vista=subir) para poder enlazarla.
export default function Inventario() {
    const [params, setParams] = useSearchParams();
    const vista = params.get('vista') === 'subir' ? 'subir' : 'gestionar';

    return (
        <div className="contenedor pagina">
            <div className="pila-chica">
                <h1 className="titulo-pagina">Inventario</h1>
                <p className="texto-suave texto-grande">Edita precios, stock y condición, quita cartas del catálogo o carga nuevas desde un CSV.</p>
            </div>
            <div role="tablist" aria-label="Secciones del inventario" className="pestanas">
                {VISTAS.map(([id, l]) => (
                    <button key={id} type="button" role="tab" aria-selected={vista === id} className={`pestana ${vista === id ? 'activo' : ''}`}
                        onClick={() => setParams({ vista: id }, { replace: true })}>{l}</button>
                ))}
            </div>
            {vista === 'subir' ? <SubirInventario /> : <GestionarCartas />}
        </div>
    );
}
