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
        "Fecha Solicitud": exp.fecha_solicitud ? exp.fecha_solicitud.split(' ')[0] : '',
        "N° Oficio / Solicitud": exp.numero_oficio,
        "Tribunal Solicitado": exp.tribunal,
        "N° de Legajo": exp.legajo || '',
        "N° Expediente": exp.num_expediente,
        "Fecha de Préstamo": exp.fecha_prestamo ? exp.fecha_prestamo.split(' ')[0] : '',
        "N° de Acta de Remisión": exp.acta_remision || '',
        "Nombre del Alguacil": exp.alguacil || '',
        "N° de Piezas": exp.num_piezas || '',
        "Observaciones": exp.observaciones || '',
        "Analista que Registró": exp.analista || '',
        "Fecha de Devolución": exp.fecha_devolucion ? exp.fecha_devolucion.split(' ')[0] : '',
        "Estado Préstamo": exp.estado
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataMapeada);

    // Configuración básica de anchos de columna para que luzca ordenado
    ws['!cols'] = [
        { wch: 15 }, // Fecha Solicitud
        { wch: 22 }, // N° Oficio
        { wch: 25 }, // Tribunal Solicitado
        { wch: 18 }, // N° de Legajo
        { wch: 18 }, // N° Expediente
        { wch: 15 }, // Fecha de Préstamo
        { wch: 20 }, // N° de Acta de Remisión
        { wch: 22 }, // Nombre del Alguacil
        { wch: 12 }, // N° de Piezas
        { wch: 30 }, // Observaciones
        { wch: 22 }, // Analista que Registró
        { wch: 15 }, // Fecha de Devolución
        { wch: 15 }  // Estado Préstamo
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Préstamos Archivo");
    XLSX.writeFile(wb, `Control_Expedientes_DAR_${new Date().getFullYear()}.xlsx`);

    lanzarToast("Archivo Excel de expedientes descargado.", "success");
}