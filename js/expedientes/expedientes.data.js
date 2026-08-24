// js/expedientes/expedientes.data.js

function obtenerCorreoActual() {
    return sessionStorage.getItem('user_email') || '';
}

// --- OBTENER EXPEDIENTES (por defecto solo los "En Préstamo") ---
export async function obtenerExpedientes(tipo = 'activos') {
    try {
        const url = tipo === 'historial'
            ? `backend/api_expedientes.php?tipo=historial`
            : `backend/api_expedientes.php`;

        const respuesta = await fetch(url, {
            credentials: 'include'
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener expedientes:", error);
        return [];
    }
}

// --- REGISTRAR NUEVO PRÉSTAMO DE EXPEDIENTE ---
export async function crearExpediente({ num, asunto, tribunal, oficio, acta, alguacil, piezas, observaciones }) {
    try {
        const respuesta = await fetch('backend/api_expedientes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ num, asunto, tribunal, oficio, acta, alguacil, piezas, observaciones })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear expediente:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}

// --- ACTUALIZAR DATOS DE UN EXPEDIENTE EXISTENTE ---
export async function actualizarExpediente({ num, numOriginal, asunto, tribunal, oficio, acta, alguacil, piezas, observaciones }) {
    try {
        const respuesta = await fetch('backend/api_expedientes.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ num, numOriginal, asunto, tribunal, oficio, acta, alguacil, piezas, observaciones })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar expediente:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}

// --- MARCAR EXPEDIENTE COMO DEVUELTO (baja lógica de estado) ---
export async function marcarExpedienteDevuelto(num) {
    try {
        const respuesta = await fetch('backend/api_expedientes.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ num, numOriginal: num, accion: 'devolver' })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al marcar el expediente como devuelto:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}

// --- ELIMINAR EXPEDIENTE (borrado físico, uso excepcional) ---
export async function eliminarExpedienteAPI(num) {
    try {
        const respuesta = await fetch('backend/api_expedientes.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ num })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar expediente:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}