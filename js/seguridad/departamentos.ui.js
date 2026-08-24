// js/seguridad/departamentos.ui.js

import { obtenerDepartamentos } from './departamentos.data.js';
import { abrirModalDepartamento, eliminarDepartamento } from './departamentos.controller.js';
import { getPaginaDepartamentos, cambiarPaginaDepartamentos } from './departamentos.controller.js';

export async function renderizarDepartamentos() {
    const tbody = document.getElementById('departamentos-body');
    const paginacion = document.getElementById('paginacion-departamentos');

    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:20px;">Cargando departamentos...</td></tr>`;

    const departamentos = await obtenerDepartamentos();
    const total = departamentos.length;

    const paginaActual = getPaginaDepartamentos();
    const porPagina = 10;

    const inicio = (paginaActual - 1) * porPagina;
    const fin = inicio + porPagina;

    const lista = departamentos.slice(inicio, fin);

    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align:center; color:#64748b;">
                    No hay departamentos registrados.
                </td>
            </tr>
        `;
        if (paginacion) paginacion.innerHTML = "";
        return;
    }

    lista.forEach(dep => {
        tbody.innerHTML += `
            <tr>
                <td>${dep.nombre}</td>
                <td style="text-align:center;">
                    <button class="btn-action btn-edit" onclick="abrirModalDepartamento(${dep.id}, '${dep.nombre.replace(/'/g, "\\'")}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarDepartamento(${dep.id}, '${dep.nombre.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    /* ============================
       PAGINACIÓN VISUAL
    ============================ */
    if (!paginacion) return;

    const totalPaginas = Math.ceil(total / porPagina);
    let botones = "";

    if (paginaActual > 1) {
        botones += `<button onclick="cambiarPaginaDepartamentos(${paginaActual - 1})">«</button>`;
    }

    for (let p = 1; p <= totalPaginas; p++) {
        botones += `
            <button 
                onclick="cambiarPaginaDepartamentos(${p})"
                class="${p === paginaActual ? 'active-page' : ''}">
                ${p}
            </button>
        `;
    }

    if (paginaActual < totalPaginas) {
        botones += `<button onclick="cambiarPaginaDepartamentos(${paginaActual + 1})">»</button>`;
    }

    paginacion.innerHTML = botones;
}