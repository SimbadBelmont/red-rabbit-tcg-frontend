export const mxn = (valor) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(valor) || 0);

export const diaMes = (fecha) => {
    const d = new Date(fecha);
    return { dia: d.getDate(), mes: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase() };
};

export const fechaLarga = (fecha) =>
    new Date(fecha).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

export const hora = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
