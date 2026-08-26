// js/core/logs.js
import { USER_NAME, USER_EMAIL } from './session.js';

/* ============================
   PAGINACIÓN AUDITORÍA (ahora resuelta en el backend)
============================ */
let paginaAuditoria = 1;
const auditoriaPorPagina = 10;

export function getPaginaAuditoria() {
    return paginaAuditoria;
}

export function cambiarPaginaAuditoria(n) {
    paginaAuditoria = n;
    renderizarAuditoria();
}

/* ============================
   CARGA DESDE LA API
============================ */
async function obtenerAuditoria(pagina, fechaDesde = null, fechaHasta = null) {
    let url = `backend/api_auditoria.php?pagina=${pagina}&por_pagina=${auditoriaPorPagina}`;
    if (fechaDesde) url += `&fecha_desde=${fechaDesde}`;
    if (fechaHasta) url += `&fecha_hasta=${fechaHasta}`;

    try {
        const respuesta = await fetch(url, { credentials: 'include' });
        return await respuesta.json();
    } catch (error) {
        console.error('Error al obtener auditoría:', error);
        return { success: false, registros: [], total: 0, total_paginas: 1 };
    }
}

function formatearFecha(fechaHora) {
    // fecha_hora viene de MySQL como 'YYYY-MM-DD HH:MM:SS'
    const fecha = new Date(fechaHora.replace(' ', 'T'));
    if (Number.isNaN(fecha.getTime())) return fechaHora;
    return fecha.toLocaleString('es-VE', { hour12: true });
}

/* ============================
   FILTRADO POR FECHA
============================ */
export function filtrarAuditoriaPorFecha() {
    paginaAuditoria = 1; // al filtrar, siempre volvemos a la primera página
    renderizarAuditoria();
}

/* ============================
   REGISTRAR UN LOG
============================ */
export async function registrarLog(operacion, descripcion) {
    try {
        await fetch('backend/api_auditoria.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: `${USER_NAME} (${USER_EMAIL})`,
                operacion,
                descripcion
            })
        });
    } catch (error) {
        console.error('Error al registrar auditoría:', error);
    }
    renderizarAuditoria();
}

/* ============================
   RENDER
============================ */
export async function renderizarAuditoria() {
    const tbody = document.getElementById('audit-body');
    const paginacion = document.getElementById('paginacion-auditoria');

    if (!tbody) return;

    const inputInicio = document.getElementById('audit-fecha-inicio');
    const inputFin = document.getElementById('audit-fecha-fin');
    const fechaDesde = inputInicio && inputInicio.value ? inputInicio.value : null;
    const fechaHasta = inputFin && inputFin.value ? inputFin.value : null;

    const data = await obtenerAuditoria(paginaAuditoria, fechaDesde, fechaHasta);
    const registros = data.registros || [];
    const totalPaginas = data.total_paginas || 1;

    tbody.innerHTML = "";

    if (registros.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Historial vacío o sin resultados para el rango seleccionado.</td></tr>`;
        if (paginacion) paginacion.innerHTML = "";
        return;
    }

    registros.forEach(log => {
        let badgeClass = 'badge-mod';
        if (log.operacion === 'alta') badgeClass = 'badge-alta';
        if (log.operacion === 'baja') badgeClass = 'badge-baja';

        tbody.innerHTML += `
            <tr>
                <td><small><i class="far fa-clock"></i> ${formatearFecha(log.fecha_hora)}</small></td>
                <td><strong>${log.usuario}</strong></td>
                <td><span class="badge-action ${badgeClass}">${log.operacion}</span></td>
                <td>${log.descripcion}</td>
            </tr>`;
    });

    if (!paginacion) return;

    let botones = "";

    if (paginaAuditoria > 1) {
        botones += `<button onclick="cambiarPaginaAuditoria(${paginaAuditoria - 1})">«</button>`;
    }

    for (let p = 1; p <= totalPaginas; p++) {
        botones += `
            <button 
                onclick="cambiarPaginaAuditoria(${p})"
                class="${p === paginaAuditoria ? 'active-page' : ''}">
                ${p}
            </button>
        `;
    }

    if (paginaAuditoria < totalPaginas) {
        botones += `<button onclick="cambiarPaginaAuditoria(${paginaAuditoria + 1})">»</button>`;
    }

    paginacion.innerHTML = botones;
}

/* ============================
   VACIAR HISTORIAL
============================ */
export async function limpiarHistorialAuditoria() {
    if (confirm("¿Seguro que desea vaciar de forma permanente la auditoría de operaciones?")) {
        try {
            const respuesta = await fetch('backend/api_auditoria.php', {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await respuesta.json();

            if (data.success) {
                await registrarLog("seguridad", "Vació el historial de auditoría de manera manual.");
            } else {
                alert(data.error || "No se pudo vaciar el historial de auditoría.");
                await renderizarAuditoria();
            }
        } catch (error) {
            console.error('Error al vaciar auditoría:', error);
            alert("Ocurrió un error al intentar vaciar el historial.");
        }
    }
}