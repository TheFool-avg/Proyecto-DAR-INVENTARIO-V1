// js/seguridad/departamentos.data.js

// --- OBTENER TODOS LOS DEPARTAMENTOS (DESDE LA BASE DE DATOS) ---
export async function obtenerDepartamentos() {
    try {
        const respuesta = await fetch('backend/api_departamentos.php', {
            credentials: 'include'
        });
        const datos = await respuesta.json();
        return datos; // Ahora devuelve [{id, nombre}, ...] en vez de solo nombres
    } catch (error) {
        console.error("Error al obtener departamentos:", error);
        return [];
    }
}

// --- CREAR NUEVO DEPARTAMENTO ---
export async function crearDepartamento(nombre) {
    try {
        const respuesta = await fetch('backend/api_departamentos.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear departamento:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}

// --- RENOMBRAR DEPARTAMENTO EXISTENTE (ahora por ID) ---
export async function actualizarDepartamento(id, nombreNuevo) {
    try {
        const respuesta = await fetch('backend/api_departamentos.php', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, nombre: nombreNuevo })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar departamento:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}

// --- ELIMINAR DEPARTAMENTO (ahora por ID) ---
export async function eliminarDepartamentoAPI(id) {
    try {
        const respuesta = await fetch('backend/api_departamentos.php', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar departamento:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}