<?php
// backend/auth_check.php
// Incluir este archivo al inicio de cualquier api_X.php que necesite
// saber quién es el usuario autenticado, según la SESIÓN DEL SERVIDOR
// (no según lo que el cliente diga en el body/query).

session_start();

function requerirSesion() {
    if (!isset($_SESSION['correo'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "No hay sesión activa. Inicie sesión nuevamente."]);
        exit;
    }

    return [
        "correo" => $_SESSION['correo'],
        "nombre" => $_SESSION['nombre'],
        "nivel"  => $_SESSION['nivel']
    ];
}
?>