// js/core/storage.js

import { USER_DEPTO } from './session.js';

// Estado principal
export let db       = JSON.parse(localStorage.getItem('dar_data'))        || [];
export let db_exp   = JSON.parse(localStorage.getItem('dar_expedientes')) || [];
export let db_bajas = JSON.parse(localStorage.getItem('dar_bajas'))       || [];

// Helpers para guardar
export function saveDB() {
    localStorage.setItem('dar_data', JSON.stringify(db));
}

export function saveExpedientes() {
    localStorage.setItem('dar_expedientes', JSON.stringify(db_exp));
}

export function saveBajas() {
    localStorage.setItem('dar_bajas', JSON.stringify(db_bajas));
}

// Backup completo
export function exportarBaseDeDatos() {
    if (USER_DEPTO !== 'todos') {
        lanzarToast?.("Solo el Administrador General puede exportar la base de datos.", "danger");
        return;
    }

    const backupData = {
        metadata: {
            fecha: new Date().toLocaleString(),
            sistema: "DAR Miranda - Inventario"
        },
        dar_usuarios: localStorage.getItem('dar_usuarios'),
        dar_data: localStorage.getItem('dar_data'),
        dar_expedientes: localStorage.getItem('dar_expedientes'),
        dar_bajas: localStorage.getItem('dar_bajas'),
        dar_logs: localStorage.getItem('dar_logs'),
        perfil_dar: localStorage.getItem('perfil_dar')
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_DAR_Miranda_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    lanzarToast?.("Respaldo descargado exitosamente", "success");
}


export function importarBaseDeDatos(event) {
    if (USER_DEPTO !== 'todos') {
        lanzarToast?.("Solo el Administrador General puede restaurar la base de datos.", "danger");
        event.target.value = "";
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    if (!confirm("⚠️ Esta acción sobrescribirá todos los datos actuales. ¿Deseas continuar?")) {
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.dar_data && !data.dar_usuarios) throw new Error("Formato inválido");

            localStorage.setItem('dar_usuarios', data.dar_usuarios);
            localStorage.setItem('dar_data', data.dar_data);
            localStorage.setItem('dar_expedientes', data.dar_expedientes);
            localStorage.setItem('dar_bajas', data.dar_bajas);
            localStorage.setItem('dar_logs', data.dar_logs);
            localStorage.setItem('perfil_dar', data.perfil_dar);

            alert("Base de datos restaurada correctamente. La página se recargará.");
            location.reload();
        } catch (error) {
            console.error(error);
            alert("Error: El archivo seleccionado no es un respaldo válido.");
        }
    };
    reader.readAsText(file);
}

export function limpiarBaseDeDatos() {
    if (USER_DEPTO !== 'todos') {
        lanzarToast?.("Solo el Administrador General puede limpiar el sistema.", "danger");
        return;
    }

    if (confirm("⚠️ Esta acción borrará TODOS los registros del sistema. ¿Continuar?")) {
        localStorage.removeItem('dar_data');
        localStorage.removeItem('dar_expedientes');
        localStorage.removeItem('dar_bajas');
        localStorage.removeItem('dar_logs');

        alert("Sistema limpiado exitosamente. La página se recargará.");
        location.reload();
    }
}
