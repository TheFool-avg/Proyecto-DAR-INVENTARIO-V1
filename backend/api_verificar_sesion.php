<?php
// backend/api_verificar_sesion.php
// El frontend llama esto al cargar sistema.html para confirmar,
// según el SERVIDOR (no según sessionStorage), si hay sesión activa.
include 'auth_check.php';
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['correo'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "No hay sesión activa"]);
    exit;
}

echo json_encode([
    "success" => true,
    "correo"  => $_SESSION['correo'],
    "nombre"  => $_SESSION['nombre'],
    "nivel"   => $_SESSION['nivel']
]);
?>