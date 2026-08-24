<?php
session_start();

include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    echo json_encode(["success" => false, "error" => "Método no permitido"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$correo = strtolower(trim($data['correo'] ?? ''));
$clave  = $data['clave'] ?? '';

if ($correo === '' || $clave === '') {
    echo json_encode(["success" => false, "error" => "Debe indicar correo y contraseña"]);
    exit;
}

$correoEscapado = $conexion->real_escape_string($correo);
$resultado = $conexion->query("SELECT nombre, correo, nivel, pass FROM usuarios WHERE correo = '$correoEscapado'");

if (!$resultado || $resultado->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "Correo electrónico o contraseña incorrectos"]);
    exit;
}

$usuario = $resultado->fetch_assoc();

if (!password_verify($clave, $usuario['pass'])) {
    echo json_encode(["success" => false, "error" => "Correo electrónico o contraseña incorrectos"]);
    exit;
}

// Login correcto: se regenera el ID de sesión (evita fijación de sesión)
// y se guarda la identidad del usuario del lado del SERVIDOR, no del cliente.
session_regenerate_id(true);
$_SESSION['correo'] = $usuario['correo'];
$_SESSION['nombre'] = $usuario['nombre'];
$_SESSION['nivel']  = $usuario['nivel'];

echo json_encode([
    "success" => true,
    "nombre"  => $usuario['nombre'],
    "correo"  => $usuario['correo'],
    "nivel"   => $usuario['nivel']
]);
?>