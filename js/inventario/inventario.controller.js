// js/inventario/inventario.controller.js

import { registrarLog } from '../core/logs.js';
import { renderizarTablas } from './inventario.ui.js';
import { lanzarToast } from '../utils/toast.js';

// --- VARIABLES ---
let indiceABorrar = null;

// --- PAGINACIÓN ---
export let paginaActual = 1;
export const registrosPorPagina = 10;

/**
 * Devuelve la página actual de la paginación.
 */
export function getPaginaActual() {
    return paginaActual;
}

/**
 * Establece la página actual de la paginación.
 */
export function setPaginaActual(nuevaPagina) {
    paginaActual = nuevaPagina;
}

/**
 * Cambia la página actual y vuelve a renderizar las tablas.
 */
export function cambiarPagina(nuevaPagina) {
    setPaginaActual(nuevaPagina);
    renderizarTablas();
}

// --- GUARDAR / EDITAR ---
export async function guardarBien(e) {
    e.preventDefault();
    const idx = document.getElementById('b-index').value;
    const esEdicion = idx !== "";

    const bienData = {
        codigoOriginal: idx, // Enviamos el código original para ubicarlo con seguridad en la BD
        codigo: document.getElementById('b-cod').value.trim().toUpperCase(),
        descripcion: document.getElementById('b-desc').value.trim(),
        marca: document.getElementById('b-mar').value.trim(),
        modelo: document.getElementById('b-mod').value.trim(),
        serial: document.getElementById('b-ser').value.trim().toUpperCase(),
        ubicacion: document.getElementById('b-ubi').value.trim(),
        area: document.getElementById('b-are').value,
        estado: document.getElementById('b-est').value
    };

    const metodoHttp = esEdicion ? 'PUT' : 'POST';

    try {
        const respuesta = await fetch('backend/api_bienes.php', {
            method: metodoHttp,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bienData)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            if (esEdicion) {
                await registrarLog("modificacion", `Modificó el activo ${bienData.codigo} (${bienData.descripcion}).`);
            } else {
                await registrarLog("alta", `Registró el nuevo activo ${bienData.codigo} (${bienData.descripcion}).`);
            }

            lanzarToast(esEdicion ? "Activo actualizado correctamente." : "Nuevo activo incorporado.", "success");
            document.getElementById('modalBien').style.display = 'none';
            setPaginaActual(1);
            renderizarTablas();
        } else {
            lanzarToast("Error: " + resultado.error, "danger");
        }
    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
        lanzarToast("Error de conexión al procesar el bien.", "danger");
    }
}

// --- DESINCORPORACIÓN ---
export function solicitarDesincorporar(codigoBien) {
    indiceABorrar = codigoBien; 
    document.getElementById('des-motivo').value = "";
    document.getElementById('des-oficio').value = "";
    document.getElementById('modalConfirmar').style.display = 'flex';
}

export async function ejecutarBorrado(e) {
    e.preventDefault();
    if (indiceABorrar === null) return;

    const motivo = document.getElementById('des-motivo').value;
    const oficio = document.getElementById('des-oficio').value.trim().toUpperCase();
    const codigoDesincorporado = indiceABorrar;

    try {
        const respuesta = await fetch('backend/api_bienes.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: indiceABorrar, motivo, oficio })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            await registrarLog("baja", `Desincorporó el activo ${codigoDesincorporado} (motivo: ${motivo}, oficio: ${oficio}).`);

            lanzarToast("Activo enviado a planilla BM-2 (Desincorporado).", "success");
            document.getElementById('modalConfirmar').style.display = 'none';
            indiceABorrar = null;
            renderizarTablas(); 
        } else {
            lanzarToast("Error al desincorporar: " + resultado.error, "danger");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        lanzarToast("Error de conexión con el servidor.", "danger");
    }
}