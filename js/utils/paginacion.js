// js/utils/paginacion.js

export const registrosPorPaginaGen = 10;

export function crearPaginacion(containerId, paginaActual, totalRegistros, callbackCambiarPagina) {
    const cont = document.getElementById(containerId);
    if (!cont) return;

    let totalPaginas = Math.ceil(totalRegistros / registrosPorPaginaGen);
    if (totalPaginas < 1) totalPaginas = 1;

    cont.innerHTML = `
        <button 
            ${paginaActual === 1 ? "disabled" : ""}
            onclick="${callbackCambiarPagina}(${paginaActual - 1})"
            class="btn-pag"
        >
            <i class="fas fa-chevron-left"></i> Anterior
        </button>

        <span class="pag-info">Página ${paginaActual} de ${totalPaginas}</span>

        <button 
            ${paginaActual >= totalPaginas ? "disabled" : ""}
            onclick="${callbackCambiarPagina}(${paginaActual + 1})"
            class="btn-pag"
        >
            Siguiente <i class="fas fa-chevron-right"></i>
        </button>
    `;
}
