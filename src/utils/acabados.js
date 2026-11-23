// Acabados de carta (mismos valores que el backend)
export const ACABADOS = {
    normal: 'Normal',
    foil: 'Foil',
    surge: 'Surge foil',
    etched: 'Etched foil',
};
export const nombreAcabado = (a) => ACABADOS[a] || a;
// Texto corto para mostrar junto al nombre ("" para las normales)
export const etiquetaAcabado = (a) => (a && a !== 'normal' ? ACABADOS[a] || a : '');
