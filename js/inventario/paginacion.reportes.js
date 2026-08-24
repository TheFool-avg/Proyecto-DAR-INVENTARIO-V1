// ===============================================
// PAGINACIÓN PARA REPORTES BM-1 Y BM-2
// ===============================================

// Cada reporte necesita su propia página actual
export let paginaBM1 = 1;
export let paginaBM2 = 1;

// Cantidad fija por página (igual que inventario)
export const registrosPorPaginaReportes = 10;

// ========================= BM-1 =========================
export function getPaginaBM1() {
    return paginaBM1;
}

export function setPaginaBM1(nueva) {
    paginaBM1 = nueva;
}

export function cambiarPaginaBM1(nueva) {
    setPaginaBM1(nueva);
    // Re-renderiza el reporte
    import('./inventario.reportes.js').then(mod => mod.renderizarReporteBM1());
}

// ========================= BM-2 =========================
export function getPaginaBM2() {
    return paginaBM2;
}

export function setPaginaBM2(nueva) {
    paginaBM2 = nueva;
}

export function cambiarPaginaBM2(nueva) {
    setPaginaBM2(nueva);
    import('./inventario.reportes.js').then(mod => mod.renderizarReporteBM2());
}

// ========================= CONTROLES =========================
export function renderizarControlesPaginacionReportes(containerId, paginaActual, totalRegistros, callback) {
    const cont = document.getElementById(containerId);
    if (!cont) return;

    cont.classList.add('paginacion-reportes', 'no-print');

    let totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaReportes);
    if (totalPaginas < 1) totalPaginas = 1;

    cont.innerHTML = `
        <button 
            ${paginaActual === 1 ? "disabled" : ""}
            onclick="${callback}(${paginaActual - 1})"
            class="btn-pag"
        >
            <i class="fas fa-chevron-left"></i> Anterior
        </button>

        <span class="pag-info">Página ${paginaActual} de ${totalPaginas}</span>

        <button 
            ${paginaActual >= totalPaginas ? "disabled" : ""}
            onclick="${callback}(${paginaActual + 1})"
            class="btn-pag"
        >
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>
    `;
}
