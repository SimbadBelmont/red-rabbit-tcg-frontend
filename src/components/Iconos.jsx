// Iconos de línea (mismo trazo que el diseño). Decorativos: aria-hidden.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const IconoConejo = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.8}>
        <path d="M9 3c-1 2-1 5 0 7" /><path d="M14 3c1 2 1 5 0 7" /><circle cx="11.5" cy="15" r="5" />
    </svg>
);
export const IconoCarrito = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={1.8}>
        <circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" />
        <path d="M2 3h3l2.6 12.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6" />
    </svg>
);
export const IconoUsuario = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
);
export const IconoCheck = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.4}><path d="M20 6 9 17l-5-5" /></svg>
);
export const IconoFlecha = ({ size = 20, izquierda = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} strokeWidth={2.2}><path d={izquierda ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} /></svg>
);
export const IconoEnlace = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
        <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
);
export const IconoSubir = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
);
export const IconoMenu = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconoCartaVacia = () => (
    <svg width="56" height="78" viewBox="0 0 64 88" fill="none" stroke="#E7A9AB" strokeWidth="2" aria-hidden="true">
        <rect x="2" y="2" width="60" height="84" rx="6" /><rect x="9" y="12" width="46" height="34" rx="3" /><path d="M9 56h46M9 64h30M9 72h38" />
    </svg>
);
