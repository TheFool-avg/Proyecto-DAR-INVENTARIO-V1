// js/expedientes/expedientes.controller.js

import { crearExpediente, actualizarExpediente, eliminarExpedienteAPI } from './expedientes.data.js';
import { registrarLog } from '../core/logs.js';
import { renderizarExpedientes, setPaginaActualExp } from './expedientes.ui.js';
import { lanzarToast } from '../utils/toast.js';

// --- GUARDAR EXPEDIENTE (CREAR O MODIFICAR) ---
export async function guardarExpediente(e) {
    e.preventDefault();

    const numOriginal = document.getElementById('e-index').value;

    const datosExp = {
        num: document.getElementById('e-num').value.trim().toUpperCase(),
        asunto: document.getElementById('e-asunto').value.trim(),
        tribunal: document.getElementById('e-tribunal').value.trim(),
        oficio: document.getElementById('e-oficio').value.trim().toUpperCase(),
        acta: document.getElementById('e-acta').value.trim().toUpperCase(),
        alguacil: document.getElementById('e-alguacil').value.trim(),
        piezas: document.getElementById('e-piezas').value.trim(),
        observaciones: document.getElementById('e-observaciones').value.trim()
    };

    let resultado;

    if (numOriginal) {
        resultado = await actualizarExpediente({ ...datosExp, numOriginal });
    } else {
        resultado = await crearExpediente(datosExp);
    }

    if (!resultado.success) {
        lanzarToast(resultado.error || 'No se pudo guardar el expediente.', 'danger');
        return;
    }

    registrarLog("archivo", numOriginal
        ? `Modificó el expediente N° ${datosExp.num}`
        : `Solicitó expediente N° ${datosExp.num}`
    );
    lanzarToast(numOriginal ? "Expediente actualizado correctamente." : "Préstamo de expediente registrado.", "success");

    document.getElementById('formExpediente').reset();
    document.getElementById('modalExpediente').style.display = 'none';

    // Al agregar uno nuevo, reiniciamos a la página 1 para visualizar los cambios
    if (!numOriginal) {
        setPaginaActualExp(1);
    }
    await renderizarExpedientes();
}

// --- ELIMINAR EXPEDIENTE (BORRADO FÍSICO) ---
export async function eliminarExpediente(num) {
    if (!confirm(`¿Eliminar permanentemente el expediente ${num}? Esta acción no se puede deshacer.`)) return;

    const resultado = await eliminarExpedienteAPI(num);

    if (!resultado.success) {
        lanzarToast(resultado.error || 'No se pudo eliminar el expediente.', 'danger');
        return;
    }

    registrarLog("archivo", `Eliminó el expediente N° ${num}`);
    lanzarToast("Expediente eliminado.", "success");

    await renderizarExpedientes();
}