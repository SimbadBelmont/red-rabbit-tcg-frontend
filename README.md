# Red Rabbit TCG — Frontend

React + Vite para la tienda Red Rabbit TCG Cuernavaca. Mismo esquema que Vizadi:
`pages/` (una vista por ruta), `components/`, `services/` (llamadas a la API con `api()`),
`context/` y `styles/`.

## Páginas

| Ruta | Página | Acceso |
|---|---|---|
| `/` | Inicio (carrusel de presentación, próximo evento, recién llegado) | Público |
| `/catalogo` | Catálogo con filtros | Público |
| `/eventos` | Tablón de eventos y reservas | Público (reservar requiere cuenta) |
| `/como-pedir` | Pasos, resumen del pedido y envío por correo | Público |
| `/contacto` | Dirección, horario, mapa y formulario | Público |
| `/login`, `/registro` | Cuenta | Público |
| `/mi-cuenta` | Wishlist, pedidos, eventos y ajustes | Con sesión |
| `/inventario` | Carga de inventario por CSV con vista previa | Staff |
| `/punto-de-venta` | Venta de mostrador | Staff |

Inventario y Punto de Venta solo aparecen en el menú con una cuenta `staff` o `admin`.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173, /api va al backend en :5000 (vite.config.js)
```

## Pendiente de llenar

- `src/pages/Contacto.jsx` → objeto `TIENDA` (dirección, horario, correo, mapa).
- `src/pages/Inicio.jsx` → cinta "Visítanos" (dirección y horario).
- `src/components/Footer.jsx` → enlaces de Instagram y Facebook.
- `src/components/HeroCarrusel.jsx` → las ilustraciones pueden cambiarse por fotos de la tienda.

## Despliegue

Igual que Vizadi: `Dockerfile` en dos etapas (build + Nginx). `nginx.conf` manda `/api` al
servicio `backend` del docker-compose. GitHub Actions publica `red-rabbit-tcg-frontend:latest`.
