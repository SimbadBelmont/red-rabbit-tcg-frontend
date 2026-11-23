// Datos de la tienda en un solo lugar (Contacto, Inicio y pie de página)
const LAT = 18.925985148857844;
const LNG = -99.24009917436368;

export const TIENDA = {
    nombre: 'Red Rabbit TCG Store',
    direccion: ['Álvaro Obregón 596, Centro', '62000 Cuernavaca, Mor.'],
    direccionCorta: 'Álvaro Obregón 596, Centro, Cuernavaca',
    horario: [
        { dias: 'Sábado a jueves', horas: '12:00 – 20:00' },
        { dias: 'Viernes', horas: 'Desde las 13:00 (cierre variable)' },
    ],
    horarioCorto: 'Sáb–Jue 12–8 pm · Vie desde 1 pm',
    correo: 'tienda@ejemplo.com',          // [PENDIENTE] correo real de la tienda
    telefono: '[TELÉFONO / WHATSAPP]',     // [PENDIENTE]
    coordenadas: { lat: LAT, lng: LNG },
    // Mapa embebido de Google Maps (no requiere API key)
    mapaUrl: `https://maps.google.com/maps?q=${LAT},${LNG}&z=17&hl=es&output=embed`,
    // Abre la app de mapas con la ruta hasta la tienda
    comoLlegarUrl: `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`,
};
