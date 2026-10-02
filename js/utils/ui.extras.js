// js/utils/ui.extras.js
/* ============================================================
   FUNCIONES EXTRA DE INTERFAZ (UI)
   Estas funciones son llamadas desde el HTML pero no existían
   en ningún módulo. Ahora están centralizadas aquí.
============================================================ */

/* ------------------------------
   1. TOGGLE DEL DROPDOWN DE PERFIL
------------------------------ */
export function toggleDropdownPer(event) {
    event.stopPropagation();

    const dd = document.getElementById('userDropdown');
    if (!dd) return;

    dd.classList.toggle('open');
}

// Cerrar dropdown al hacer clic fuera
window.addEventListener('click', () => {
    const dd = document.getElementById('userDropdown');
    if (dd) dd.classList.remove('open');
});


/* ------------------------------
   2. CERRAR MODAL DE CONFIRMACIÓN DE BAJA
------------------------------ */
export function cerrarModalConfirmar() {
    const modal = document.getElementById('modalConfirmar');
    if (modal) modal.style.display = 'none';
}


/* ------------------------------
   3. EXPORTAR REPORTE BM-2 A EXCEL (respeta el filtro de área)
------------------------------ */
export async function exportarBM2Excel() {
    let bajas = [];

    try {
        const respuesta = await fetch('backend/api_bienes.php?tipo=baja', {
            credentials: 'include'
        });
        bajas = await respuesta.json();
    } catch (error) {
        console.error("Error al obtener las bajas:", error);
        alert("No se pudo conectar con el servidor para obtener las bajas.");
        return;
    }

    if (!Array.isArray(bajas) || bajas.length === 0) {
        alert("No hay bajas registradas para exportar.");
        return;
    }

    // Respetar el mismo filtro de área que se ve en pantalla
    const selectFiltro = document.getElementById('filtro-reporte-area-bm2');
    const areaFiltro = selectFiltro ? selectFiltro.value : 'todos';

    const filtradas = areaFiltro === 'todos'
        ? bajas
        : bajas.filter(item => item.area === areaFiltro);

    if (filtradas.length === 0) {
        alert("No hay bajas registradas para el área seleccionada.");
        return;
    }

    const dataMapeada = filtradas.map(item => ({
        "Código": item.codigo,
        "Descripción": item.descripcion,
        "Marca": item.marca || '',
        "Modelo": item.modelo || '',
        "Serial": item.serial || '-',
        "Área Procedencia": item.area,
        "Fecha Baja": item.fecha_baja ? item.fecha_baja.split(' ')[0] : '-',
        "Motivo Legal": item.motivo_baja || 'N/A',
        "N° Oficio": item.oficio_baja || 'N/A'
    }));

    const hoja = XLSX.utils.json_to_sheet(dataMapeada);
    const libro = XLSX.utils.book_new();

    hoja['!cols'] = [
        { wch: 18 }, // Código
        { wch: 30 }, // Descripción
        { wch: 15 }, // Marca
        { wch: 15 }, // Modelo
        { wch: 15 }, // Serial
        { wch: 20 }, // Área Procedencia
        { wch: 15 }, // Fecha Baja
        { wch: 25 }, // Motivo Legal
        { wch: 18 }  // N° Oficio
    ];

    XLSX.utils.book_append_sheet(libro, hoja, "BM-2");

    const sufijoArea = areaFiltro === 'todos' ? '' : `_${areaFiltro.replace(/\s+/g, '_')}`;
    XLSX.writeFile(libro, `Reporte_BM2${sufijoArea}.xlsx`);
}