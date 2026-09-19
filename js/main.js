// js/main.js

/* ============================
   NÚCLEO
============================ */
import { logout } from './core/session.js';
import { 
    limpiarHistorialAuditoria, 
    cambiarPaginaAuditoria, 
    filtrarAuditoriaPorFecha,
    renderizarAuditoria
} from './core/logs.js';

/* ============================
   INVENTARIO
============================ */
import {
    guardarBien,
    solicitarDesincorporar,
    ejecutarBorrado,
    cambiarPagina
} from './inventario/inventario.controller.js';

import {
    abrirModalBien,
    cerrarModalBien,
    filtrar,
    renderizarTablas
} from './inventario/inventario.ui.js';

import {
    renderizarReporteBM1,
    renderizarReporteBM2
} from './inventario/inventario.reportes.js';

/* ============================
   PAGINACIÓN REPORTES (NUEVO)
============================ */
import {
    cambiarPaginaBM1,
    cambiarPaginaBM2
} from './inventario/paginacion.reportes.js';

/* ============================
   EXPEDIENTES
============================ */
import {
    guardarExpediente,
    eliminarExpediente
} from './expedientes/expedientes.controller.js';
import {
    abrirModalExpediente,
    cerrarModalExpediente,
    renderizarExpedientes
} from './expedientes/expedientes.ui.js';

import { exportarExcelExpedientes } from './expedientes/expedientes.export.js';

/* ============================
   PERFIL
============================ */
import { guardarPerfil } from './perfil/perfil.controller.js';
import {
    abrirModalPerfil,
    cerrarModalPerfil,
    aplicarCambiosPerfilUI
} from './perfil/perfil.ui.js';

/* ============================
   SEGURIDAD - USUARIOS Y DEPARTAMENTOS
============================ */
import {
    abrirModalUsuario,
    cerrarModalUsuario,
    guardarUsuario,
    eliminarUsuario
} from './seguridad/usuarios.controller.js';

import { renderizarUsuarios } from './seguridad/usuarios.ui.js';

import {
    abrirModalDepartamento,
    cerrarModalDepartamento,
    guardarDepartamento,
    eliminarDepartamento,
    cambiarPaginaDepartamentos
} from './seguridad/departamentos.controller.js';

import { renderizarDepartamentos } from './seguridad/departamentos.ui.js';

/* ============================
   NAVEGACIÓN + DASHBOARD
============================ */
import { irA } from './navigation/router.js';
import { inicializarDashboard } from './dashboard/dashboard.controller.js';

/* ============================
   FUNCIONES EXTRA (UI)
============================ */
import {
    toggleDropdownPer,
    cerrarModalConfirmar,
    exportarBM2Excel
} from './utils/ui.extras.js';


/* ============================
   PAGINACION INVENTARIO
============================ */
window.cambiarPagina = cambiarPagina;

/* ============================
   PAGINACION REPORTES (NUEVO)
============================ */
window.cambiarPaginaBM1 = cambiarPaginaBM1;
window.cambiarPaginaBM2 = cambiarPaginaBM2;

/* ============================
   PAGINACION DEPARTAMENTOS (NUEVO)
============================ */
window.cambiarPaginaDepartamentos = cambiarPaginaDepartamentos;

/* ============================
   PAGINACION AUDITORÍA (NUEVO)
============================ */
window.cambiarPaginaAuditoria = cambiarPaginaAuditoria;
window.filtrarAuditoriaPorFecha = filtrarAuditoriaPorFecha;
window.renderizarAuditoria = renderizarAuditoria;

/* ============================
   EXPONER AL HTML
============================ */
window.logout = logout;

window.limpiarHistorialAuditoria = limpiarHistorialAuditoria;

window.guardarBien = guardarBien;
window.solicitarDesincorporar = solicitarDesincorporar;
window.ejecutarBorrado = ejecutarBorrado;

window.abrirModalBien = abrirModalBien;
window.cerrarModalBien = cerrarModalBien;
window.filtrar = filtrar;

window.renderizarReporteBM1 = renderizarReporteBM1;
window.renderizarReporteBM2 = renderizarReporteBM2;

window.guardarExpediente = guardarExpediente;
window.eliminarExpediente = eliminarExpediente;

window.abrirModalExpediente = abrirModalExpediente;
window.cerrarModalExpediente = cerrarModalExpediente;

window.exportarExcelExpedientes = exportarExcelExpedientes;

window.guardarPerfil = guardarPerfil;
window.abrirModalPerfil = abrirModalPerfil;
window.cerrarModalPerfil = cerrarModalPerfil;

/* === SEGURIDAD: NUEVAS FUNCIONES EXPUESTAS === */
window.abrirModalUsuario = abrirModalUsuario;
window.cerrarModalUsuario = cerrarModalUsuario;
window.guardarUsuario = guardarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.renderizarUsuarios = renderizarUsuarios;

window.abrirModalDepartamento = abrirModalDepartamento;
window.cerrarModalDepartamento = cerrarModalDepartamento;
window.guardarDepartamento = guardarDepartamento;
window.eliminarDepartamento = eliminarDepartamento;
window.renderizarDepartamentos = renderizarDepartamentos;

window.irA = irA;

/* === FUNCIONES EXTRA === */
window.toggleDropdownPer = toggleDropdownPer;
window.cerrarModalConfirmar = cerrarModalConfirmar;
window.exportarBM2Excel = exportarBM2Excel;

/* ============================
   INICIALIZACIÓN (con verificación real de sesión)
============================ */
async function verificarSesionYArrancar() {
    try {
        const respuesta = await fetch('backend/api_verificar_sesion.php', {
            credentials: 'include'
        });

        if (!respuesta.ok) {
            // No hay sesión válida según el SERVIDOR: fuera de aquí.
            window.location.href = "index.html";
            return;
        }

        // Sesión confirmada por el servidor: sincronizamos sessionStorage
        // (solo para que la UI muestre nombre/rol) y arrancamos la app.
        const datos = await respuesta.json();
        sessionStorage.setItem('user_usuario', datos.usuario);
        sessionStorage.setItem('user_name', datos.nombre);
        sessionStorage.setItem('user_depto', datos.nivel);

        inicializarDashboard();
    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        window.location.href = "index.html";
    }
}

window.addEventListener('load', () => {
    verificarSesionYArrancar();
});