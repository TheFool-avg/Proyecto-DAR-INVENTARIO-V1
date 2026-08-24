// js/expedientes/expedientes.export.js

import { obtenerExpedientes } from './expedientes.data.js';
import { lanzarToast } from '../utils/toast.js';

export async function exportarExcelExpedientes() {
    // Usamos "historial" para que "Exportar Todo" incluya también los ya devueltos
    const expedientes = await obtenerExpedientes('historial');

    if (expedientes.length === 0) {
        lanzarToast("No hay registros de expedientes para exportar.", "warning");
        return;
    }

    const dataMapeada = expedientes.map(exp => ({
        "N° Expediente": exp.num_expediente,
        "Carátula / Asunto": exp.asunto,
        "Tribunal Solicitado": exp.tribunal,
        "N° Oficio / Solicitud": exp.numero_oficio,
        "Fecha Solicitud": exp.fecha_solicitud ? exp.fecha_solicitud.split(' ')[0] : '',
        "N° de Acta de Remisión": exp.acta_remision || '',
        "Nombre del Alguacil": exp.alguacil || '',
        "N° de Piezas": exp.num_piezas || '',
        "Observaciones": exp.observaciones || '',
        "Estado Préstamo": exp.estado
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataMapeada);

    // Configuración básica de anchos de columna para que luzca ordenado
    ws['!cols'] = [
        { wch: 18 }, // N° Expediente
        { wch: 30 }, // Carátula / Asunto
        { wch: 25 }, // Tribunal Solicitado
        { wch: 22 }, // N° Oficio
        { wch: 15 }, // Fecha Solicitud
        { wch: 20 }, // N° de Acta de Remisión
        { wch: 22 }, // Nombre del Alguacil
        { wch: 12 }, // N° de Piezas
        { wch: 30 }, // Observaciones
        { wch: 15 }  // Estado Préstamo
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Préstamos Archivo");
    XLSX.writeFile(wb, `Control_Expedientes_DAR_${new Date().getFullYear()}.xlsx`);

    lanzarToast("Archivo Excel de expedientes descargado.", "success");
}