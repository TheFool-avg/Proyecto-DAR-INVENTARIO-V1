// js/perfil/perfil.ui.js

import { cargarPerfil } from './perfil.controller.js';

// --- ABRIR MODAL ---
export async function abrirModalPerfil() {
    const data = await cargarPerfil();

    document.getElementById('p-nombre').value = data.nombre;
    document.getElementById('p-cargo').value = data.cargo;

    document.getElementById('modalPerfil').style.display = 'flex';
}

// --- CERRAR MODAL ---
export function cerrarModalPerfil() {
    document.getElementById('modalPerfil').style.display = 'none';
}

// --- APLICAR CAMBIOS EN EL HEADER ---
export async function aplicarCambiosPerfilUI() {
    const data = await cargarPerfil();

    document.getElementById('display-user').innerText =
        data.nombre.substring(0, 2).toUpperCase();

    document.getElementById('full-user-name').innerText = data.nombre;

    const roleEl = document.querySelector('.user-role');
    if (roleEl) roleEl.innerText = data.cargo;
}