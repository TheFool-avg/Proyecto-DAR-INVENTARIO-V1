// js/seguridad/departamentos.controller.js

import { obtenerDepartamentos, crearDepartamento, actualizarDepartamento, eliminarDepartamentoAPI } from './departamentos.data.js';
import { renderizarDepartamentos } from './departamentos.ui.js';
import { registrarLog } from '../core/logs.js';
import { lanzarToast } from '../utils/toast.js';
import { obtenerUsuarios, actualizarUsuario } from './usuarios.data.js';
import { renderizarMenuInventarioDepartamentos } from '../dashboard/dashboard.controller.js';

/* ============================================================
   PAGINACIÓN DEPARTAMENTOS
============================================================ */
let paginaDepartamentos = 1;
const departamentosPorPagina = 10;

export function getPaginaDepartamentos() {
    return paginaDepartamentos;
}

export function cambiarPaginaDepartamentos(n) {
    paginaDepartamentos = n;
    renderizarDepartamentos();
}

let departamentoEditandoId = null;

export function abrirModalDepartamento(id = null, nombre = null) {
    departamentoEditandoId = id;
    const modal = document.getElementById('modalDepartamento');
    const form = document.getElementById('formDepartamento');
    const input = document.getElementById('d-nombre');

    form.reset();
    input.removeAttribute('disabled');

    if (nombre) {
        input.value = nombre;
        input.focus();
    } else {
        input.value = '';
        input.focus();
    }

    modal.style.display = 'flex';
}

export function cerrarModalDepartamento() {
    document.getElementById('modalDepartamento').style.display = 'none';
}

// --- GUARDAR (CREAR O RENOMBRAR) ---
export async function guardarDepartamento(e) {
    e.preventDefault();

    const nombre = document.getElementById('d-nombre').value.trim();

    if (!nombre) {
        lanzarToast('Debe escribir el nombre del departamento.', 'danger');
        return;
    }

    let resultado;

    if (departamentoEditandoId) {
        resultado = await actualizarDepartamento(departamentoEditandoId, nombre);
    } else {
        resultado = await crearDepartamento(nombre);
    }

    if (!resultado.success) {
        lanzarToast(resultado.error || 'No se pudo guardar el departamento.', 'danger');
        return;
    }

    registrarLog('seguridad', departamentoEditandoId ? `Modificó departamento ${nombre}` : `Registró nuevo departamento ${nombre}`);

    const eraEdicion = departamentoEditandoId !== null;
    cerrarModalDepartamento();
    departamentoEditandoId = null;

    await renderizarDepartamentos();
    renderizarMenuInventarioDepartamentos();
    window.renderizarReporteBM1?.();

    lanzarToast(eraEdicion ? 'Departamento actualizado.' : 'Departamento registrado.', 'success');
}

// --- ELIMINAR ---
export async function eliminarDepartamento(id, nombre) {
    if (!confirm(`¿Eliminar el departamento ${nombre}?`)) return;

    const resultado = await eliminarDepartamentoAPI(id);

    if (!resultado.success) {
        lanzarToast(resultado.error || 'No se pudo eliminar el departamento.', 'danger');
        return;
    }

    // Reasignar a "Finanzas" los usuarios que pertenecían a este departamento (identificados por ID)
    await reasignarUsuariosADepartamento(id, 'Finanzas');

    registrarLog('seguridad', `Eliminó departamento ${nombre}`);

    await renderizarDepartamentos();
    renderizarMenuInventarioDepartamentos();
    window.renderizarReporteBM1?.();

    lanzarToast('Departamento eliminado.', 'success');
}

// --- REASIGNAR TODOS LOS USUARIOS DE UN DEPARTAMENTO (por ID) A OTRO NIVEL ---
async function reasignarUsuariosADepartamento(departamentoId, nuevoNivel) {
    const usuarios = await obtenerUsuarios();

    const afectados = usuarios.filter(u => u.departamento_id === departamentoId);

    await Promise.all(
        afectados.map(u =>
            actualizarUsuario({ correo: u.correo, nombre: u.nombre, nivel: nuevoNivel, clave: '' })
        )
    );
}