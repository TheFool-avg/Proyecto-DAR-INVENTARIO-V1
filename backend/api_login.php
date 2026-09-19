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

$usuarioInput = strtolower(trim($data['usuario'] ?? ''));
$clave  = $data['clave'] ?? '';

if ($usuarioInput === '' || $clave === '') {
    echo json_encode(["success" => false, "error" => "Debe indicar usuario y contraseña"]);
    exit;
}

$usuarioEscapado = $conexion->real_escape_string($usuarioInput);
$resultado = $conexion->query("SELECT nombre, usuario, nivel, pass FROM usuarios WHERE usuario = '$usuarioEscapado'");

if (!$resultado || $resultado->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "Usuario o contraseña incorrectos"]);
    exit;
}

$usuario = $resultado->fetch_assoc();

if (!password_verify($clave, $usuario['pass'])) {
    echo json_encode(["success" => false, "error" => "Usuario o contraseña incorrectos"]);
    exit;
}

// Login correcto: se regenera el ID de sesión (evita fijación de sesión)
// y se guarda la identidad del usuario del lado del SERVIDOR, no del cliente.
session_regenerate_id(true);
$_SESSION['usuario'] = $usuario['usuario'];
$_SESSION['nombre']  = $usuario['nombre'];
$_SESSION['nivel']   = $usuario['nivel'];

echo json_encode([
    "success" => true,
    "nombre"  => $usuario['nombre'],
    "usuario" => $usuario['usuario'],
    "nivel"   => $usuario['nivel']
]);
?>