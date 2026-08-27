<?php
include 'conexion.php';
include 'auth_check.php';
header('Content-Type: application/json; charset=utf-8');

$usuarioActual = requerirSesion();

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: OBTENER TODOS LOS USUARIOS (nivel calculado en vivo desde departamentos) ---
if ($method == 'GET') {
    $sql = "SELECT u.id, u.nombre, u.correo, u.departamento_id,
                   CASE WHEN u.departamento_id IS NULL THEN 'todos' ELSE d.nombre END AS nivel
            FROM usuarios u
            LEFT JOIN departamentos d ON u.departamento_id = d.id
            ORDER BY u.nombre ASC";

    $resultado = $conexion->query($sql);

    $usuarios = [];
    while ($row = $resultado->fetch_assoc()) {
        $usuarios[] = $row;
    }
    echo json_encode($usuarios);
    exit;
}

// --- POST: REGISTRAR NUEVO USUARIO (SOLO ADMINISTRADOR GENERAL) ---
if ($method == 'POST') {
    if ($usuarioActual['nivel'] !== 'todos') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tienes permisos para crear usuarios"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $nombre = trim($data['nombre'] ?? '');
    $correo = strtolower(trim($data['correo'] ?? ''));
    $nivel  = trim($data['nivel'] ?? '');
    $clave  = $data['clave'] ?? '';

    if ($nombre === '' || $correo === '' || $nivel === '' || $clave === '') {
        echo json_encode(["success" => false, "error" => "Todos los campos son obligatorios"]);
        exit;
    }

    $correoEscapado = $conexion->real_escape_string($correo);
    $check = $conexion->query("SELECT id FROM usuarios WHERE correo = '$correoEscapado'");

    if ($check && $check->num_rows > 0) {
        echo json_encode(["success" => false, "error" => "El correo ya está registrado"]);
        exit;
    }

    // Resolver el departamento_id a partir del nombre recibido en "nivel"
    $departamentoId = null;
    $nivelEscapado = $conexion->real_escape_string($nivel);

    if ($nivel !== 'todos') {
        $resDep = $conexion->query("SELECT id FROM departamentos WHERE nombre = '$nivelEscapado'");
        if (!$resDep || $resDep->num_rows === 0) {
            echo json_encode(["success" => false, "error" => "El departamento indicado no existe"]);
            exit;
        }
        $departamentoId = intval($resDep->fetch_assoc()['id']);
    }

    $nombreEscapado = $conexion->real_escape_string($nombre);
    $hash           = password_hash($clave, PASSWORD_DEFAULT);
    $depIdSql       = $departamentoId === null ? "NULL" : $departamentoId;

    $sql = "INSERT INTO usuarios (nombre, correo, nivel, departamento_id, pass)
            VALUES ('$nombreEscapado', '$correoEscapado', '$nivelEscapado', $depIdSql, '$hash')";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Usuario registrado correctamente"]);
    } else {
        error_log("Error MySQL en api_usuarios.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
    }
    exit;
}

// --- PUT: EDITAR USUARIO EXISTENTE (SOLO ADMINISTRADOR GENERAL — LA CONTRASEÑA SOLO SE ACTUALIZA SI SE ENVÍA) ---
if ($method == 'PUT') {
    if ($usuarioActual['nivel'] !== 'todos') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tienes permisos para editar usuarios"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $correo = strtolower(trim($data['correo'] ?? ''));
    $nombre = trim($data['nombre'] ?? '');
    $nivel  = trim($data['nivel'] ?? '');
    $clave  = $data['clave'] ?? '';

    if ($correo === '' || $nombre === '' || $nivel === '') {
        echo json_encode(["success" => false, "error" => "Datos incompletos para actualizar"]);
        exit;
    }

    // Resolver el departamento_id a partir del nombre recibido en "nivel"
    $departamentoId = null;
    $nivelEscapado = $conexion->real_escape_string($nivel);

    if ($nivel !== 'todos') {
        $resDep = $conexion->query("SELECT id FROM departamentos WHERE nombre = '$nivelEscapado'");
        if (!$resDep || $resDep->num_rows === 0) {
            echo json_encode(["success" => false, "error" => "El departamento indicado no existe"]);
            exit;
        }
        $departamentoId = intval($resDep->fetch_assoc()['id']);
    }

    $correoEscapado = $conexion->real_escape_string($correo);
    $nombreEscapado = $conexion->real_escape_string($nombre);
    $depIdSql       = $departamentoId === null ? "NULL" : $departamentoId;

    if ($clave !== '') {
        $hash = password_hash($clave, PASSWORD_DEFAULT);
        $sql = "UPDATE usuarios SET nombre = '$nombreEscapado', nivel = '$nivelEscapado', departamento_id = $depIdSql, pass = '$hash' WHERE correo = '$correoEscapado'";
    } else {
        $sql = "UPDATE usuarios SET nombre = '$nombreEscapado', nivel = '$nivelEscapado', departamento_id = $depIdSql WHERE correo = '$correoEscapado'";
    }

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Usuario actualizado correctamente"]);
    } else {
        error_log("Error MySQL en api_usuarios.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
    }
    exit;
}

// --- DELETE: ELIMINAR USUARIO (SOLO ADMINISTRADOR GENERAL) ---
if ($method == 'DELETE') {
    if ($usuarioActual['nivel'] !== 'todos') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tienes permisos para eliminar usuarios"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $correo = strtolower(trim($data['correo'] ?? ''));

    if ($correo === '') {
        echo json_encode(["success" => false, "error" => "No se especificó el usuario a eliminar"]);
        exit;
    }

    $correoEscapado = $conexion->real_escape_string($correo);
    $sql = "DELETE FROM usuarios WHERE correo = '$correoEscapado'";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Usuario eliminado correctamente"]);
    } else {
        error_log("Error MySQL en api_usuarios.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
    }
    exit;
}
?>