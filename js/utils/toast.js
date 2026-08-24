// js/utils/toast.js

export function lanzarToast(mensaje, tipo) {
    const box = document.getElementById('toast-box');
    if (!box) return;

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${tipo === 'success' ? '#10b981' : '#ef4444'};
        color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 10px;
        font-size: 0.85rem; box-shadow: var(--shadow-lg);
        display: flex; align-items: center; gap: 10px; font-weight: 500;
    `;
    toast.innerHTML = `<i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> <span>${mensaje}</span>`;

    box.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}