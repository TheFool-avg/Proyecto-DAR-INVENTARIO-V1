// js/navigation/router.js

import { renderizarReporteBM1, renderizarReporteBM2 } from '../inventario/inventario.reportes.js';
import { renderizarExpedientes } from '../expedientes/expedientes.ui.js';
import { renderizarAuditoria } from '../core/logs.js';
import { renderizarTablas } from '../inventario/inventario.ui.js';
import { renderizarUsuarios } from '../seguridad/usuarios.ui.js';
import { renderizarDepartamentos } from '../seguridad/departamentos.ui.js';

let filtroAreaActual = 'todos';

export function irA(sec, area = 'todos') {
    filtroAreaActual = area;

    const secciones = [
        'sec-dashboard',
        'sec-bm1',
        'sec-reporte-bm1',
        'sec-reporte-bm2',
        'sec-expedientes',
        'sec-auditoria',
        'sec-usuarios',
        'sec-departamentos'
    ];

    secciones.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));

    const active = document.getElementById(sec);
    if (active) active.style.display = 'block';

    if (sec === 'sec-bm1') {
        const titulo = document.getElementById('titulo-inventario');

        if (area === 'todos') {
            titulo.innerText = "Inventario General de Bienes";
            document.getElementById('menu-inv-todos')?.classList.add('active');
        } else {
            titulo.innerText = `Inventario - Área de ${area}`;
            document.getElementById(`menu-${area.toLowerCase()}`)?.classList.add('active');
        }
    }

    if (sec === 'sec-dashboard') document.getElementById('menu-dash').classList.add('active');
    if (sec === 'sec-reporte-bm1') document.getElementById('menu-rep-bm1').classList.add('active');
    if (sec === 'sec-reporte-bm2') document.getElementById('menu-rep-bm2').classList.add('active');
    if (sec === 'sec-expedientes') document.getElementById('menu-exp').classList.add('active');
    if (sec === 'sec-auditoria') document.getElementById('menu-log').classList.add('active');
    if (sec === 'sec-usuarios') document.getElementById('menu-usuarios').classList.add('active');
    if (sec === 'sec-departamentos') document.getElementById('menu-departamentos').classList.add('active');

    if (sec === 'sec-bm1') {
        document.querySelectorAll('[data-inventory-area]').forEach(el => el.classList.remove('active'));
        if (area === 'todos') {
            document.getElementById('menu-inv-todos')?.classList.add('active');
        } else {
            document.querySelector(`[data-inventory-area="${area}"]`)?.classList.add('active');
        }
    }

    if (sec === 'sec-reporte-bm1') renderizarReporteBM1();
    if (sec === 'sec-reporte-bm2') renderizarReporteBM2();
    if (sec === 'sec-expedientes') renderizarExpedientes();
    if (sec === 'sec-auditoria') renderizarAuditoria();
    if (sec === 'sec-usuarios') renderizarUsuarios();
    if (sec === 'sec-departamentos') renderizarDepartamentos();

    renderizarTablas();
}

export function getFiltroAreaActual() {
    return filtroAreaActual;
}