// js/seguridad/usuarios.controller.js

import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuarioAPI } from './usuarios.data.js';
import { obtenerDepartamentos } from './departamentos.data.js';
import { renderizarUsuarios } from './usuarios.ui.js';
import { registrarLog } from '../core/logs.js';
import { lanzarToast } from '../utils/toast.js';

let usuarioEditando = null;

/* ============================================================
   PAGINACIÓN USUARIOS (10 por página)
============================================================ */
let paginaUsuarios = 1;
const usuariosPorPagina = 10;

export function getPaginaUsuarios() {
    return paginaUsuarios;
}

export function setPaginaUsuarios(n) {
    paginaUsuarios = n;
}

export function cambiarPaginaUsuarios(n) {
    paginaUsuarios = n;
    renderizarUsuarios();
}

/* ============================================================
   ABRIR / CERRAR MODAL
============================================================ */
export async function abrirModalUsuario(correo = null) {
    usuarioEditando = correo;

    const modal = document.getElementById('modalUsuario');
    const form = document.getElementById('formUsuario');
    const selectNivel = document.getElementById('u-nivel');
    const inputPass = document.getElementById('u-pass');
    const titulo = document.getElementById('modal-usuario-titulo');

    form.reset();
    await poblarSelectDepartamentos(selectNivel);

    if (correo) {
        if (titulo) titulo.innerText = "Modificar Usuario";

        const usuarios = await obtenerUsuarios();
        const u = usuarios.find(us => us.correo === correo);

        if (u) {
            document.getElementById('u-nombre').value = u.nombre;
            document.getElementById('u-correo').value = u.correo;
            document.getElementById('u-nivel').value = u.nivel;
        }

        inputPass.value = '';
        inputPass.placeholder = 'Dejar en blanco para mantener la contraseña actual';
        inputPass.removeAttribute('required');

        document.getElementById('u-correo').setAttribute('disabled', 'true');
    } else {
        if (titulo) titulo.innerText = "Registrar Nuevo Usuario";

        inputPass.value = '';
        inputPass.placeholder = '';
        inputPass.setAttribute('required', 'true');
        document.getElementById('u-correo').removeAttribute('disabled');
    }

    modal.style.display = 'flex';
}

export function cerrarModalUsuario() {
    document.getElementById('modalUsuario').style.display = 'none';
}

/* ============================================================
   GUARDAR USUARIO (CREAR / EDITAR)
============================================================ */
export async function guardarUsuario(e) {
    e.preventDefault();

    const nombreCompleto = document.getElementById('u-nombre').value.trim();
    const correo = document.getElementById('u-correo').value.trim().toLowerCase();
    const nivel = document.getElementById('u-nivel').value;
    const clave = document.getElementById('u-pass').value;

    if (!nombreCompleto) {
        lanzarToast("Debe indicar el nombre del usuario.", "danger");
        return;
    }

    // Advertencia especial para Administrador General
    if (nivel === "todos") {
        const confirmar = confirm(
            "Si eliges este nivel el usuario tendrá acceso a todos los departamentos y funciones administrativas.\n\n¿Seguro que deseas continuar?"
        );

        if (!confirmar) return;
    }

    const departamentos = await obtenerDepartamentos();

    if (!departamentos.some(dep => dep.nombre === nivel) && nivel !== 'todos') {
        lanzarToast('Seleccione un departamento válido.', 'danger');
        return;
    }

    const usuarioActual = sessionStorage.getItem("user_email");
    const editandoAMiMismo = usuarioEditando && usuarioActual === correo;

    // ============================================================
    // 🔐 BLOQUEO 1: Un administrador NO puede bajarse el nivel
    // ============================================================
    if (editandoAMiMismo) {
        const nivelActualPropio = sessionStorage.getItem('user_depto');
        if (nivelActualPropio === 'todos' && nivel !== 'todos') {
            lanzarToast("Un administrador no puede cambiar su nivel a analista.", "danger");
            return;
        }
    }

    // ============================================================
    // 🔐 BLOQUEO 2: Un administrador NO puede cambiar su propia contraseña desde el gestor
    // ============================================================
    if (editandoAMiMismo && clave !== '') {
        lanzarToast("No puedes cambiar tu propia contraseña desde el gestor. Usa tu perfil.", "danger");
        return;
    }

    let resultado;

    if (usuarioEditando) {
        resultado = await actualizarUsuario({ correo, nombre: nombreCompleto, nivel, clave });
    } else {
        if (clave === '') {
            lanzarToast('Debe indicar una contraseña para el nuevo usuario.', 'danger');
            return;
        }
        resultado = await crearUsuario({ nombre: nombreCompleto, correo, nivel, clave });
    }

    if (!resultado.success) {
        lanzarToast(resultado.error || 'No se pudo guardar el usuario.', 'danger');
        return;
    }

    registrarLog("seguridad", usuarioEditando ?
        `Modificó usuario ${correo}` :
        `Registró nuevo usuario ${correo}`
    );

    const eraEdicion = usuarioEditando !== null;
    cerrarModalUsuario();
    usuarioEditando = null;

    // 🔥 Volver a página 1 al agregar usuario nuevo
    if (!eraEdicion) {
        setPaginaUsuarios(1);
    }

    await renderizarUsuarios();
    lanzarToast("Usuario guardado correctamente.", "success");
}

/* ============================================================
   POBLAR SELECT DE DEPARTAMENTOS
============================================================ */
async function poblarSelectDepartamentos(selectNivel) {
    const departamentos = await obtenerDepartamentos();
    selectNivel.innerHTML = `
        <option value="" disabled selected hidden>Selecciona el nivel...</option>
    `;

    departamentos.forEach(dep => {
        const option = document.createElement('option');
        option.value = dep.nombre;
        option.textContent = `Analista de ${dep.nombre}`;
        selectNivel.appendChild(option);
    });

    const optionAdmin = document.createElement('option');
    optionAdmin.value = 'todos';
    optionAdmin.textContent = 'Administrador General';
    selectNivel.appendChild(optionAdmin);
}

/* ============================================================
   ELIMINAR USUARIO
============================================================ */
export async function eliminarUsuario(correo) {

    const usuarioActual = sessionStorage.getItem("user_email");

    if (correo === usuarioActual) {
        lanzarToast("No puedes eliminar tu propio usuario.", "danger");
        return;
    }

    if (!confirm(`¿Eliminar al usuario ${correo}?`)) return;

    const resultado = await eliminarUsuarioAPI(correo);

    if (!resultado.success) {
        lanzarToast(resultado.error || 'No se pudo eliminar el usuario.', 'danger');
        return;
    }

    registrarLog("seguridad", `Eliminó usuario ${correo}`);

    // 🔥 Mantener la página actual
    await renderizarUsuarios();
    lanzarToast("Usuario eliminado.", "success");
}