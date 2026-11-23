import { api } from './api';

// Encargado y administrador. Fechas en formato AAAA-MM-DD.
export const resumenEmpleados = (desde, hasta) => api(`/reportes/empleados?desde=${desde}&hasta=${hasta}`);
export const detalleEmpleado = (id, desde, hasta) => api(`/reportes/empleados/${id}?desde=${desde}&hasta=${hasta}`);
