// js/seguridad/usuarios.data.js

// --- OBTENER TODOS LOS USUARIOS (DESDE LA BASE DE DATOS, SIN CONTRASEÑA) ---
export async function obtenerUsuarios() {
    try {
        const respuesta = await fetch('backend/api_usuarios.php', {
            credentials: 'include'
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return [];
    }
}

// --- CREAR NUEVO USUARIO ---
export async function crearUsuario({ nombre, correo, nivel, clave }) {
    try {
        const respuesta = await fetch('backend/api_usuarios.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, correo, nivel, clave })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al crear usuario:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}

// --- EDITAR USUARIO EXISTENTE (clave vacía = se conserva la actual) ---
export async function actualizarUsuario({ correo, nombre, nivel, clave }) {
    try {
        const respuesta = await fetch('backend/api_usuarios.php', {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, nombre, nivel, clave })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}

// --- ELIMINAR USUARIO ---
export async function eliminarUsuarioAPI(correo) {
    try {
        const respuesta = await fetch('backend/api_usuarios.php', {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo })
        });
        return await respuesta.json();
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return { success: false, error: "Error de conexión con el servidor." };
    }
}