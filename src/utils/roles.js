export const ROLES = {
    cliente: 'Cliente',
    staff: 'Empleado',
    encargado: 'Encargado',
    admin: 'Administrador',
};
export const nombreRol = (rol) => ROLES[rol] || rol;
