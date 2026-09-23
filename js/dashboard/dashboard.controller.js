// js/dashboard/dashboard.controller.js

import { USER_DEPTO } from '../core/session.js';
import { aplicarCambiosPerfilUI } from '../perfil/perfil.ui.js';
import { renderizarTablas } from '../inventario/inventario.ui.js';
import { renderizarExpedientes } from '../expedientes/expedientes.ui.js';
import { obtenerExpedientes } from '../expedientes/expedientes.data.js';
import { obtenerDepartamentos } from '../seguridad/departamentos.data.js';

function generarIdMenuDepartamento(nombre) {
    return `menu-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export async function renderizarMenuInventarioDepartamentos() {
    const contenedor = document.getElementById('menu-inventario-departamentos');
    if (!contenedor) return;

    const departamentos = await obtenerDepartamentos();
    contenedor.innerHTML = '';

    departamentos.forEach(dep => {
        const nombre = dep.nombre;
        const label = nombre === 'Servicios Judiciales' ? 'Servicios Judiciales' : `Dpto. ${nombre}`;
        const icono = nombre === 'Tecnología' ? 'fa-laptop-code' : nombre === 'Finanzas' ? 'fa-wallet' : nombre === 'Servicios Judiciales' ? 'fa-gavel' : 'fa-building';

        const item = document.createElement('li');
        item.id = generarIdMenuDepartamento(nombre);
        item.className = 'sidebar-item-dpto';
        item.setAttribute('data-inventory-area', nombre);
        item.onclick = () => window.irA('sec-bm1', nombre);
        item.innerHTML = `<i class="fas ${icono}"></i> <span>${label}</span>`;
        contenedor.appendChild(item);
    });
}

export async function configurarInterfazSegunRol() {
    await renderizarMenuInventarioDepartamentos();

    const itemsDepto = document.querySelectorAll('[data-inventory-area]');

    if (USER_DEPTO !== 'todos') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.getElementById('menu-exp')?.style.setProperty('display', USER_DEPTO === 'Servicios Judiciales' ? 'block' : 'none');

        itemsDepto.forEach(el => {
            el.style.display = el.getAttribute('data-inventory-area') === USER_DEPTO ? 'block' : 'none';
        });
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        itemsDepto.forEach(el => el.style.display = 'block');
    }
}

// --- ACTUALIZAR TARJETAS DEL DASHBOARD (AHORA DESDE LA BASE DE DATOS REAL) ---
export async function actualizarDashboard() {
    try {
        const respuesta = await fetch('backend/api_bienes.php', {
            credentials: 'include'
        });
        const db = await respuesta.json();

        const total = db.length;
        const excelente = db.filter(i => i.estado === 'Excelente').length;
        const regular = db.filter(i => i.estado === 'Regular').length;
        const danado = db.filter(i => i.estado === 'Dañado').length;

        document.getElementById('dash-total').innerText = total;
        document.getElementById('dash-excelente').innerText = excelente;
        document.getElementById('dash-regular').innerText = regular;
        document.getElementById('dash-danado').innerText = danado;
    } catch (error) {
        console.error("Error al cargar las cifras del dashboard:", error);
    }

    // --- TARJETA DE EXPEDIENTES REGISTRADOS ---
    const dashExpedientes = document.getElementById('dash-expedientes');
    if (dashExpedientes) {
        try {
            const expedientes = await obtenerExpedientes('historial');
            dashExpedientes.innerText = Array.isArray(expedientes) ? expedientes.length : '-';
        } catch (error) {
            console.error("Error al cargar el total de expedientes:", error);
            dashExpedientes.innerText = '-';
        }
    }
}

export async function inicializarDashboard() {
    await configurarInterfazSegunRol();
    aplicarCambiosPerfilUI();
    await actualizarDashboard();
    renderizarTablas();
    renderizarExpedientes();
}