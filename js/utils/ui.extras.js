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
   3. EXPORTAR REPORTE BM-2 A EXCEL
------------------------------ */
export async function exportarBM2Excel() {
    let bajas = [];

    try {
        const respuesta = await fetch('backend/api_bienes.php?tipo=baja');
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

    const hoja = XLSX.utils.json_to_sheet(bajas);
    const libro = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(libro, hoja, "BM-2");
    XLSX.writeFile(libro, "Reporte_BM2.xlsx");
}