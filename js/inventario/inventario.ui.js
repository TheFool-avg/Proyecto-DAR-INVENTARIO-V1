// js/inventario/inventario.ui.js

import { USER_DEPTO } from '../core/session.js';
import { solicitarDesincorporar } from './inventario.controller.js';
import { getFiltroAreaActual } from '../navigation/router.js';
import { obtenerDepartamentos } from '../seguridad/departamentos.data.js';

// Importamos control de paginación desde el controlador
import {
    registrosPorPagina,
    getPaginaActual,
    setPaginaActual
} from './inventario.controller.js';

// --- RENDERIZADO PRINCIPAL CON PAGINACIÓN + BÚSQUEDA (DESDE LA BD) ---
export async function renderizarTablas() {
    const tbody = document.querySelector("#tabla tbody");
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px;">Cargando datos desde la base de datos...</td></tr>`;

    try {
        const respuesta = await fetch('backend/api_bienes.php', {
            credentials: 'include'
        });
        const db = await respuesta.json();

        tbody.innerHTML = "";

        const areaSeleccionada = getFiltroAreaActual();
        const searchInput = document.getElementById("searchInput");
        const texto = searchInput ? searchInput.value.toLowerCase() : "";

        const datosFiltrados = db.filter(item => {
            const coincideArea = (areaSeleccionada === 'todos' || item.area === areaSeleccionada);

            const textoEnBien =
                (item.codigo || '').toLowerCase().includes(texto) ||
                (item.descripcion || '').toLowerCase().includes(texto) ||
                (item.marca || '').toLowerCase().includes(texto) ||
                (item.modelo || '').toLowerCase().includes(texto) ||
                (item.serial || '').toLowerCase().includes(texto) ||
                (item.ubicacion || '').toLowerCase().includes(texto);

            return coincideArea && textoEnBien;
        });

        let totalPaginas = Math.ceil(datosFiltrados.length / registrosPorPagina);
        if (totalPaginas < 1) totalPaginas = 1;

        let pagina = getPaginaActual();
        if (pagina > totalPaginas) pagina = totalPaginas;
        if (pagina < 1) pagina = 1;

        setPaginaActual(pagina);

        const inicio = (pagina - 1) * registrosPorPagina;
        const datosPagina = datosFiltrados.slice(inicio, inicio + registrosPorPagina);

        datosPagina.forEach((item) => {
            const puedeEditar = (USER_DEPTO === 'todos' || USER_DEPTO === item.area);

            const acciones = puedeEditar
                ? `
                    <button class="btn-action btn-edit" onclick="abrirModalBien('${item.codigo}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="solicitarDesincorporar('${item.codigo}')">
                        <i class="fas fa-arrow-alt-circle-down"></i>
                    </button>
                  `
                : `<span style="font-size:0.75rem; color:var(--text-muted);">Solo Lectura</span>`;

            tbody.innerHTML += `
                <tr>
                    <td><strong>${item.codigo}</strong></td>
                    <td>${item.descripcion}</td>
                    <td>${item.marca || '-'}</td>
                    <td>${item.modelo || '-'}</td>
                    <td>${item.serial || '-'}</td>
                    <td>${item.ubicacion}</td>
                    <td><span class="area-tag">${item.area}</span></td>
                    <td><span class="status-tag ${obtenerClaseEstado(item.estado)}">${item.estado}</span></td>
                    <td style="text-align:center;">${acciones}</td>
                </tr>`;
        });

        renderizarControlesPaginacion(datosFiltrados.length);

    } catch (error) {
        console.error("Error al cargar la tabla desde la API:", error);
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red; padding:20px;">Error al conectar con la base de datos.</td></tr>`;
    }
}

// --- FUNCIÓN DE CONTROL DE PAGINACIÓN ---
function renderizarControlesPaginacion(totalRegistrosFiltrados) {
    const tabla = document.querySelector("#tabla");
    if (!tabla) return;

    let container = document.getElementById('paginacion-container');

    if (!container) {
        container = document.createElement('div');
        container.id = 'paginacion-container';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.gap = '10px';
        container.style.marginTop = '10px';
        tabla.after(container);
    }

    let totalPaginas = Math.ceil(totalRegistrosFiltrados / registrosPorPagina);
    if (totalPaginas < 1) totalPaginas = 1;

    const pagina = getPaginaActual();

    container.innerHTML = `
        <button 
            onclick="cambiarPagina(${pagina - 1})" 
            ${pagina === 1 ? 'disabled' : ''}
            style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5f5; background:#f1f5f9; cursor:pointer;"
        >
            <i class="fas fa-chevron-left"></i> Anterior
        </button>
        
        <span style="font-size:0.85rem; color:#4b5563;">
            Página ${pagina} de ${totalPaginas}
        </span>
        
        <button 
            onclick="cambiarPagina(${pagina + 1})" 
            ${pagina >= totalPaginas ? 'disabled' : ''}
            style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5f5; background:#f1f5f9; cursor:pointer;"
        >
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>
    `;
}

// --- MODALES ---
async function poblarSelectAreas(select) {
    const departamentos = await obtenerDepartamentos();
    const actual = select.value;
    select.innerHTML = '';

    const optionGeneral = document.createElement('option');
    optionGeneral.value = 'todos';
    optionGeneral.textContent = 'Inventario General';
    select.appendChild(optionGeneral);

    departamentos.forEach(dep => {
        const option = document.createElement('option');
        option.value = dep.nombre;
        option.textContent = dep.nombre;
        select.appendChild(option);
    });

    if (actual && Array.from(select.options).some(opt => opt.value === actual)) {
        select.value = actual;
    } else if (USER_DEPTO !== 'todos') {
        select.value = USER_DEPTO;
    }
}

export async function abrirModalBien(codigoBien = null) {
    document.getElementById('formBien').reset();
    document.getElementById('b-index').value = codigoBien ?? "";

    const selectArea = document.getElementById('b-are');
    await poblarSelectAreas(selectArea);

    if (USER_DEPTO !== 'todos') {
        selectArea.value = USER_DEPTO;
        selectArea.setAttribute('disabled', 'true');
    } else {
        selectArea.removeAttribute('disabled');
    }

    if (codigoBien !== null) {
        document.getElementById('modal-bien-titulo').innerText = "Modificar Activo";
        try {
            const respuesta = await fetch('backend/api_bienes.php', {
                credentials: 'include'
            });
            const db = await respuesta.json();
            const item = db.find(b => b.codigo === codigoBien);

            if (item) {
                document.getElementById('b-cod').value = item.codigo;
                document.getElementById('b-desc').value = item.descripcion;
                document.getElementById('b-mar').value = item.marca || "";
                document.getElementById('b-mod').value = item.modelo || "";
                document.getElementById('b-ser').value = item.serial || "";
                document.getElementById('b-ubi').value = item.ubicacion;
                document.getElementById('b-are').value = item.area;
                document.getElementById('b-est').value = item.estado;
            }
        } catch (error) {
            console.error("Error al obtener el bien para editar:", error);
        }
    } else {
        document.getElementById('modal-bien-titulo').innerText = "Registrar Activo";
    }

    document.getElementById('modalBien').style.display = 'flex';
}

// CORREGIDO: Se agregó 'export' para que main.js pueda importarlo correctamente
export function cerrarModalBien() {
    document.getElementById('modalBien').style.display = 'none';
}

// --- UTILIDADES ---
export function obtenerClaseEstado(est) {
    if (est === 'Excelente') return 'status-success';
    if (est === 'Regular') return 'status-warning';
    return 'status-danger';
}

export function filtrar() {
    setPaginaActual(1);
    renderizarTablas();
}