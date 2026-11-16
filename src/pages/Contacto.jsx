import { useState } from 'react';

// Datos de la tienda: reemplazar los valores entre corchetes
const TIENDA = {
    direccion: ['[CALLE Y NÚMERO]', '[COLONIA], Cuernavaca, Mor.'],
    horario: ['Lun – Vie: [00:00 – 00:00]', 'Sáb – Dom: [00:00 – 00:00]'],
    correo: 'tienda@ejemplo.com',
    telefono: '[TELÉFONO / WHATSAPP]',
    mapaUrl: '', // URL "Insertar mapa" de Google Maps
};

export default function Contacto() {
    const [form, setForm] = useState({ nombre: '', asunto: 'Duda sobre una carta', mensaje: '' });

    // Abre el correo del cliente ya redactado (sin backend extra)
    const enviar = (e) => {
        e.preventDefault();
        const cuerpo = `${form.mensaje}\n\n— ${form.nombre}`;
        window.location.href = `mailto:${TIENDA.correo}?subject=${encodeURIComponent(form.asunto)}&body=${encodeURIComponent(cuerpo)}`;
    };

    return (
        <div className="contenedor pagina">
            <div className="pila-chica">
                <h1 className="titulo-pagina">Visítanos en Cuernavaca</h1>
                <p className="texto-suave texto-grande">Ven a jugar, a cambiar cartas o a recoger tu pedido.</p>
            </div>
            <div className="con-lateral con-lateral--derecha">
                <div className="contenido pila">
                    {TIENDA.mapaUrl
                        ? <iframe title="Mapa de la tienda" src={TIENDA.mapaUrl} className="mapa" loading="lazy" />
                        : <div className="mapa mapa--vacio">[Mapa de Google Maps]</div>}
                    <div className="rejilla rejilla--220">
                        <div className="tarjeta pila-chica"><span className="sobretitulo">DIRECCIÓN</span>{TIENDA.direccion.map((l) => <span key={l}>{l}</span>)}</div>
                        <div className="tarjeta pila-chica"><span className="sobretitulo">HORARIO</span>{TIENDA.horario.map((l) => <span key={l}>{l}</span>)}</div>
                        <div className="tarjeta pila-chica"><span className="sobretitulo">CONTACTO</span><a href={`mailto:${TIENDA.correo}`}>{TIENDA.correo}</a><span>{TIENDA.telefono}</span></div>
                    </div>
                </div>
                <form className="tarjeta tarjeta--rosa lateral pila" onSubmit={enviar}>
                    <h2 className="titulo-tarjeta">Escríbenos</h2>
                    <label className="etiqueta">Nombre<input className="campo" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
                    <label className="etiqueta">Asunto
                        <select className="campo" value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })}>
                            <option>Duda sobre una carta</option><option>Eventos</option><option>Compra / venta de colección</option><option>Otro</option>
                        </select>
                    </label>
                    <label className="etiqueta">Mensaje<textarea className="campo" rows="5" required value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} /></label>
                    <button type="submit" className="btn btn--rojo btn--grande">Enviar mensaje</button>
                </form>
            </div>
        </div>
    );
}
