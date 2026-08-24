// js/core/session.js

export const USER_DEPTO = sessionStorage.getItem('user_depto') || 'todos';
export const USER_EMAIL = sessionStorage.getItem('user_email') || 'analista@dar.gob.ve';
export const USER_NAME  = sessionStorage.getItem('user_name')  || 'Usuario Analista';

export async function logout() {
    try {
        await fetch('backend/api_logout.php', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error("Error al cerrar sesión en el servidor:", error);
        // Aunque falle la llamada al servidor, igual sacamos al usuario localmente
    }

    sessionStorage.clear();
    window.location.href = "index.html";
}