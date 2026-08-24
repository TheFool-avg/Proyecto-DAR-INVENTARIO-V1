// js/perfil/perfil.controller.js

import { USER_DEPTO, USER_NAME } from '../core/session.js';
import { aplicarCambiosPerfilUI } from './perfil.ui.js';
import { obtenerUsuarios, actualizarUsuario } from '../seguridad/usuarios.data.js';

// --- GUARDAR PERFIL ---
export async function guardarPerfil(e) {
    e.preventDefault();

    const nombre = document.getElementById('p-nombre').value.trim();
    const correo = sessionStorage.getItem('user_email');

    if (!nombre || !correo) {
        document.getElementById('modalPerfil').style.display = 'none';
        return;
    }

    const resultado = await actualizarUsuario({
        correo,
        nombre,
        nivel: USER_DEPTO,
        clave: ''
    });

    if (!resultado.success) {
        console.error("Error al actualizar el perfil:", resultado.error);
        return;
    }

    // Mantenemos sessionStorage sincronizado con el nuevo nombre
    sessionStorage.setItem('user_name', nombre);

    await aplicarCambiosPerfilUI();
    document.getElementById('modalPerfil').style.display = 'none';

    setTimeout(() => location.reload(), 200);
}

// --- CARGAR PERFIL ---
export async function cargarPerfil() {
    const correo = sessionStorage.getItem('user_email');
    const cargoCalculado = USER_DEPTO === 'todos'
        ? 'Administrador General'
        : `Analista de ${USER_DEPTO}`;

    if (!correo) {
        return { nombre: USER_NAME, cargo: cargoCalculado };
    }

    const usuarios = await obtenerUsuarios();
    const u = usuarios.find(us => us.correo === correo);

    if (!u) {
        return { nombre: USER_NAME, cargo: cargoCalculado };
    }

    return { nombre: u.nombre, cargo: cargoCalculado };
}