// js/expedientes/expedientes.ui.js

import { obtenerExpedientes } from './expedientes.data.js';
import { eliminarExpediente } from './expedientes.controller.js';

// --- ESTADO DE PAGINACIÓN ---
export let paginaActualExp = 1;
const registrosPorPagina = 10;

// --- RENDERIZAR TABLA CON PAGINACIÓN (DESDE LA BASE DE DATOS) ---
export async function renderizarExpedientes() {
    const tbody = document.querySelector("#tabla-expedientes tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; padding:20px;">Cargando expedientes...</td></tr>`;

    const respuesta = await obtenerExpedientes();

    // Si el backend rechazó la petición (no autorizado) o devolvió un objeto de error,
    // no intentamos paginar nada: mostramos la tabla vacía silenciosamente.
    const expedientes = Array.isArray(respuesta) ? respuesta : [];

    if (!Array.isArray(respuesta)) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; color:var(--text-muted);">No tiene acceso al módulo de Expedientes.</td></tr>`;
        const contenedorPag = document.getElementById("paginacion-expedientes");
        if (contenedorPag) contenedorPag.remove();
        return;
    }

    // Corrección de página fuera de rango (ej. si eliminamos el último registro de una página)
    let totalPaginas = Math.ceil(expedientes.length / registrosPorPagina) || 1;
    if (paginaActualExp > totalPaginas) paginaActualExp = totalPaginas;
    if (paginaActualExp < 1) paginaActualExp = 1;

    const inicio = (paginaActualExp - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const expedientesPagina = expedientes.slice(inicio, fin);

    tbody.innerHTML = "";

    if (expedientesPagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; color:var(--text-muted);">No hay expedientes en préstamo.</td></tr>`;
        renderizarControlesPaginacion(expedientes.length);
        return;
    }

    expedientesPagina.forEach(exp => {
        const fechaSolicitud = exp.fecha_solicitud ? exp.fecha_solicitud.split(' ')[0] : '-';
        const fechaPrestamo = exp.fecha_prestamo ? exp.fecha_prestamo.split(' ')[0] : '-';
        const fechaDevolucion = exp.fecha_devolucion ? exp.fecha_devolucion.split(' ')[0] : '-';

        tbody.innerHTML += `
            <tr>
                <td>${fechaSolicitud}</td>
                <td>${exp.numero_oficio}</td>
                <td>${exp.tribunal}</td>
                <td>${exp.legajo || '-'}</td>
                <td><strong>${exp.num_expediente}</strong></td>
                <td>${fechaPrestamo}</td>
                <td>${exp.acta_remision || '-'}</td>
                <td>${exp.alguacil || '-'}</td>
                <td>${exp.num_piezas || '-'}</td>
                <td>${exp.observaciones || '-'}</td>
                <td>${exp.analista || '-'}</td>
                <td>${fechaDevolucion}</td>
                <td><span class="status-tag status-warning">${exp.estado}</span></td>
                <td style="text-align:center;">
                    <button class="btn-action btn-edit" onclick="abrirModalExpediente('${exp.num_expediente}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="eliminarExpediente('${exp.num_expediente}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });

    renderizarControlesPaginacion(expedientes.length);
}

// --- GENERAR BOTONES DE PAGINACIÓN ---
function renderizarControlesPaginacion(totalRegistros) {
    const tablaContainer = document.querySelector("#sec-expedientes .table-container");
    if (!tablaContainer) return;

    // Remover contenedor previo si ya existe para no duplicarlo
    let contenedorPag = document.getElementById("paginacion-expedientes");
    if (contenedorPag) {
        contenedorPag.remove();
    }

    const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina) || 1;

    contenedorPag = document.createElement("div");
    contenedorPag.id = "paginacion-expedientes";
    contenedorPag.className = "paginacion-reportes";
    contenedorPag.style.marginTop = "15px";

    let htmlBotones = `
        <button class="btn-primary-lg" ${paginaActualExp === 1 ? 'disabled style="background:#cbd5e1; cursor:not-allowed;"' : ''} onclick="cambiarPaginaExp(${paginaActualExp - 1})">
            <i class="fas fa-chevron-left"></i> Anterior
        </button>
    `;

    htmlBotones += `<span style="font-weight:bold; margin:0 15px; color:var(--accent);">Página ${paginaActualExp} de ${totalPaginas}</span>`;

    htmlBotones += `
        <button class="btn-primary-lg" ${paginaActualExp === totalPaginas ? 'disabled style="background:#cbd5e1; cursor:not-allowed;"' : ''} onclick="cambiarPaginaExp(${paginaActualExp + 1})">
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>
    `;

    contenedorPag.innerHTML = htmlBotones;
    tablaContainer.after(contenedorPag);
}

// --- FUNCIÓN PARA CAMBIAR DE PÁGINA ---
window.cambiarPaginaExp = function(nuevaPagina) {
    if (nuevaPagina < 1) nuevaPagina = 1;
    paginaActualExp = nuevaPagina;
    renderizarExpedientes();
};

// --- FUNCIÓN ADICIONAL PARA RE-AJUSTAR LA PÁGINA DESDE EL CONTROLLER ---
export function setPaginaActualExp(nuevaPag) {
    paginaActualExp = nuevaPag;
}

// --- MODALES ---
export async function abrirModalExpediente(numExpediente = null) {
    document.getElementById('formExpediente').reset();
    document.getElementById('e-index').value = numExpediente ?? '';

    const titulo = document.getElementById('modal-expediente-titulo');

    if (numExpediente) {
        if (titulo) titulo.innerText = 'Modificar Expediente';

        const respuesta = await obtenerExpedientes('historial');
        const expedientes = Array.isArray(respuesta) ? respuesta : [];
        const exp = expedientes.find(x => x.num_expediente === numExpediente);

        if (exp) {
            document.getElementById('e-num').value = exp.num_expediente;
            document.getElementById('e-fecha-solicitud').value = exp.fecha_solicitud ? exp.fecha_solicitud.split(' ')[0] : '';
            document.getElementById('e-tribunal').value = exp.tribunal;
            document.getElementById('e-oficio').value = exp.numero_oficio;
            document.getElementById('e-legajo').value = exp.legajo || '';
            document.getElementById('e-fecha-prestamo').value = exp.fecha_prestamo ? exp.fecha_prestamo.split(' ')[0] : '';
            document.getElementById('e-acta').value = exp.acta_remision || '';
            document.getElementById('e-alguacil').value = exp.alguacil || '';
            document.getElementById('e-piezas').value = exp.num_piezas || '';
            document.getElementById('e-analista').value = exp.analista || '';
            document.getElementById('e-observaciones').value = exp.observaciones || '';
            document.getElementById('e-fecha-devolucion').value = exp.fecha_devolucion ? exp.fecha_devolucion.split(' ')[0] : '';
        }
    } else {
        if (titulo) titulo.innerText = 'Solicitud de Archivo Judicial';
    }

    document.getElementById('modalExpediente').style.display = 'flex';
}

export function cerrarModalExpediente() {
    document.getElementById('modalExpediente').style.display = 'none';
}