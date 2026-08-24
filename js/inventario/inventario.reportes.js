// js/inventario/inventario.reportes.js

import { obtenerDepartamentos } from '../seguridad/departamentos.data.js';

// PAGINACIÓN
import {
    getPaginaBM1,
    setPaginaBM1,
    cambiarPaginaBM1,
    getPaginaBM2,
    setPaginaBM2,
    cambiarPaginaBM2,
    registrosPorPaginaReportes,
    renderizarControlesPaginacionReportes
} from './paginacion.reportes.js';

async function poblarSelectAreasReporte() {
    const select = document.getElementById('filtro-reporte-area');
    if (!select) return;

    const actual = select.value;
    const departamentos = await obtenerDepartamentos();

    select.innerHTML = '';

    const optionGeneral = document.createElement('option');
    optionGeneral.value = 'todos';
    optionGeneral.textContent = 'Todas las Áreas';
    select.appendChild(optionGeneral);

    departamentos.forEach(dep => {
        const option = document.createElement('option');
        option.value = dep.nombre;
        option.textContent = dep.nombre;
        select.appendChild(option);
    });

    if (actual && Array.from(select.options).some(opt => opt.value === actual)) {
        select.value = actual;
    } else {
        select.value = 'todos';
    }
}

// ========================= BM-1 =========================
export async function renderizarReporteBM1() {
    await poblarSelectAreasReporte();

    const areaFiltro = document.getElementById('filtro-reporte-area').value;
    const bm1body = document.getElementById("bm1-body");
    if (!bm1body) return;

    bm1body.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px;">Cargando reporte...</td></tr>`;
    document.getElementById('bm1-fecha').innerText = new Date().toLocaleDateString('es-VE');

    try {
        const respuesta = await fetch('backend/api_bienes.php?tipo=activos');
        const db = await respuesta.json();

        bm1body.innerHTML = "";

        // 1. Filtrar
        const filtrados = db.filter(item => {
            if (areaFiltro !== 'todos' && item.area !== areaFiltro) return false;
            return true;
        });

        // 2. Paginación
        let pagina = getPaginaBM1();
        let totalPaginas = Math.ceil(filtrados.length / registrosPorPaginaReportes);
        if (totalPaginas < 1) totalPaginas = 1;

        if (pagina > totalPaginas) pagina = totalPaginas;
        if (pagina < 1) pagina = 1;

        setPaginaBM1(pagina);

        const inicio = (pagina - 1) * registrosPorPaginaReportes;
        const datosPagina = filtrados.slice(inicio, inicio + registrosPorPaginaReportes);

        if (datosPagina.length === 0) {
            bm1body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No hay activos registrados.</td></tr>`;
            return;
        }

        // 3. Renderizar
        datosPagina.forEach(item => {
            bm1body.innerHTML += `
                <tr>
                    <td><strong>${item.codigo}</strong></td>
                    <td>${item.descripcion}</td>
                    <td>${item.marca || '-'}</td>
                    <td>${item.modelo || '-'}</td>
                    <td>${item.serial || '-'}</td>
                    <td>${item.ubicacion}</td>
                    <td>${item.area}</td>
                    <td>${item.estado}</td>
                </tr>`;
        });

        // 4. Controles de paginación
        renderizarControlesPaginacionReportes(
            "paginacion-bm1",
            pagina,
            filtrados.length,
            "cambiarPaginaBM1"
        );
    } catch (error) {
        console.error("Error al cargar reporte BM-1:", error);
        bm1body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red;">Error al cargar los datos.</td></tr>`;
    }
}

// ========================= BM-2 =========================
export async function renderizarReporteBM2() {
    const tbody = document.getElementById('bm2-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Cargando bienes desincorporados...</td></tr>`;

    try {
        // Solicitamos específicamente los bienes desincorporados a la base de datos
        const respuesta = await fetch('backend/api_bienes.php?tipo=baja');
        const db_bajas = await respuesta.json();

        tbody.innerHTML = "";

        if (!db_bajas || db_bajas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">No hay bajas registradas.</td></tr>`;
            return;
        }

        // 1. Paginación
        let pagina = getPaginaBM2();
        let totalPaginas = Math.ceil(db_bajas.length / registrosPorPaginaReportes);
        if (totalPaginas < 1) totalPaginas = 1;

        if (pagina > totalPaginas) pagina = totalPaginas;
        if (pagina < 1) pagina = 1;

        setPaginaBM2(pagina);

        const inicio = (pagina - 1) * registrosPorPaginaReportes;
        const datosPagina = db_bajas.slice(inicio, inicio + registrosPorPaginaReportes);

        // 2. Renderizar
        datosPagina.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:var(--danger);">${item.codigo}</strong></td>
                    <td>${item.descripcion}</td>
                    <td>${item.marca || ''} ${item.modelo || ''}</td>
                    <td>${item.serial || '-'}</td>
                    <td><span class="area-tag">${item.area}</span></td>
                    <td>${item.fecha_baja ? item.fecha_baja.split(' ')[0] : '-'}</td>
                    <td><strong>${item.motivo_baja || 'N/A'}</strong><br><small>Oficio: ${item.oficio_baja || 'N/A'}</small></td>
                </tr>`;
        });

        // 3. Controles de paginación
        renderizarControlesPaginacionReportes(
            "paginacion-bm2",
            pagina,
            db_bajas.length,
            "cambiarPaginaBM2"
        );
    } catch (error) {
        console.error("Error al cargar reporte BM-2:", error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error al conectar con la base de datos.</td></tr>`;
    }
}