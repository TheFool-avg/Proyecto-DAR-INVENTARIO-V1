// --- LOGICA DE AUTENTICACIÓN (LOGIN) ---
async function entrar() {
    const usuario = document.getElementById('u_usuario').value.trim().toLowerCase();
    const clave = document.getElementById('u_clave').value;

    if (!usuario || !clave) {
        mostrarNotificacion("Por favor, introduzca sus credenciales.", "error");
        return;
    }

    try {
        const respuesta = await fetch('backend/api_login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, clave })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            sessionStorage.setItem('sesion_activa', 'true');
            sessionStorage.setItem('user_usuario', resultado.usuario);
            sessionStorage.setItem('user_name', resultado.nombre);
            sessionStorage.setItem('user_depto', resultado.nivel);

            mostrarNotificacion("Acceso concedido. Redirigiendo...", "success");
            setTimeout(() => { window.location.href = "sistema.html"; }, 1200);
        } else {
            mostrarNotificacion(resultado.error || "Usuario o contraseña incorrectos.", "error");
        }
    } catch (error) {
        console.error("Error de conexión con el servidor:", error);
        mostrarNotificacion("Error de conexión con el servidor.", "error");
    }
}

// --- MANEJO EXTRA: VISIBILIDAD DE CONTRASEÑAS ---
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('u_clave');
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });
}

// --- MANEJO EXTRA: NOTIFICACIONES FLOTANTES AL ESTILO TOAST ---
function mostrarNotificacion(mensaje, tipo) {
    const vieja = document.querySelector('.toast-success, .toast-error');
    if (vieja) vieja.remove();
    
    const toast = document.createElement("div");
    toast.className = tipo === 'success' ? 'toast-success' : 'toast-error';
    const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas ${icono}" style="font-size: 1.2rem;"></i>
        <div>
            <strong style="display:block; font-size: 0.8rem;">${tipo === 'success' ? 'ÉXITO' : 'ERROR'}</strong>
            <small style="font-size: 0.75rem; opacity: 0.9;">${mensaje}</small>
        </div>`;
        
    document.body.appendChild(toast);
    setTimeout(() => { if(toast) toast.remove(); }, 3500);
}

// --- MANEJO EXTRA: CONTROL INTELIGENTE DE LA TECLA ENTER ---
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        entrar();
    }
});