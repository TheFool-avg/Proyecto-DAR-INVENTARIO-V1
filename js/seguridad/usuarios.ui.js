// js/seguridad/usuarios.ui.js

import { obtenerUsuarios } from './usuarios.data.js';
import { abrirModalUsuario, eliminarUsuario } from './usuarios.controller.js';
import { getPaginaUsuarios, cambiarPaginaUsuarios } from './usuarios.controller.js';

/* ============================================================
   RENDERIZAR USUARIOS CON PAGINACIÓN
============================================================ */
export async function renderizarUsuarios() {
    const tbody = document.getElementById('usuarios-body');
    const paginacion = document.getElementById('paginacion-usuarios');

    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Cargando usuarios...</td></tr>`;

    const usuarios = await obtenerUsuarios();
    const total = usuarios.length;

    const paginaActual = getPaginaUsuarios();
    const usuariosPorPagina = 10;

    const inicio = (paginaActual - 1) * usuariosPorPagina;
    const fin = inicio + usuariosPorPagina;

    const lista = usuarios.slice(inicio, fin);

    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No hay usuarios registrados.</td></tr>`;
        if (paginacion) paginacion.innerHTML = "";
        return;
    }

    const usuarioActual = sessionStorage.getItem("user_usuario");

    lista.forEach(u => {
        let botones = "";

        // Bloquear edición y eliminación del propio usuario
        if (u.usuario !== usuarioActual) {
            botones = `
                <button class="btn-action btn-edit" onclick="abrirModalUsuario('${u.usuario}')">
                    <i class="fas fa-edit"></i>
                </button>

                <button class="btn-action btn-delete" onclick="eliminarUsuario('${u.usuario}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
        } else {
            botones = `
                <span style="color:#64748b; font-size:0.8rem;">
                    (No permitido)
                </span>
            `;
        }

        tbody.innerHTML += `
            <tr>
                <td>${u.nombre}</td>
                <td>${u.usuario}</td>
                <td>${u.nivel}</td>
                <td style="text-align:center;">${botones}</td>
            </tr>
        `;
    });

    /* ============================================================
       PAGINACIÓN VISUAL
    ============================================================ */
    if (!paginacion) return;

    const totalPaginas = Math.ceil(total / usuariosPorPagina);
    let botones = "";

    // Flecha « anterior
    if (paginaActual > 1) {
        botones += `<button onclick="cambiarPaginaUsuarios(${paginaActual - 1})">«</button>`;
    }

    // Botones numerados
    for (let p = 1; p <= totalPaginas; p++) {
        botones += `
            <button 
                onclick="cambiarPaginaUsuarios(${p})"
                class="${p === paginaActual ? 'active-page' : ''}">
                ${p}
            </button>
        `;
    }

    // Flecha » siguiente
    if (paginaActual < totalPaginas) {
        botones += `<button onclick="cambiarPaginaUsuarios(${paginaActual + 1})">»</button>`;
    }

    paginacion.innerHTML = botones;
}