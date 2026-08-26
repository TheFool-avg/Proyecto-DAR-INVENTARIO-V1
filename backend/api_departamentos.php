<?php
include 'conexion.php';
include 'auth_check.php';
header('Content-Type: application/json; charset=utf-8');

$usuarioActual = requerirSesion();

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: OBTENER TODOS LOS DEPARTAMENTOS ---
if ($method == 'GET') {
    $resultado = $conexion->query("SELECT * FROM departamentos ORDER BY nombre ASC");

    $departamentos = [];
    while ($row = $resultado->fetch_assoc()) {
        $departamentos[] = $row;
    }
    echo json_encode($departamentos);
    exit;
}

// --- POST: REGISTRAR NUEVO DEPARTAMENTO (SOLO ADMINISTRADOR GENERAL) ---
if ($method == 'POST') {
    if ($usuarioActual['nivel'] !== 'todos') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tienes permisos para crear departamentos"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || empty(trim($data['nombre'] ?? ''))) {
        echo json_encode(["success" => false, "error" => "Debe indicar el nombre del departamento"]);
        exit;
    }

    $nombre = $conexion->real_escape_string(trim($data['nombre']));

    // Verificar duplicados (sin importar mayúsculas/minúsculas)
    $check = $conexion->query("SELECT id FROM departamentos WHERE LOWER(nombre) = LOWER('$nombre')");
    if ($check && $check->num_rows > 0) {
        echo json_encode(["success" => false, "error" => "Ese departamento ya está registrado"]);
        exit;
    }

    $sql = "INSERT INTO departamentos (nombre) VALUES ('$nombre')";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Departamento registrado correctamente", "id" => $conexion->insert_id]);
    } else {
        echo json_encode(["success" => false, "error" => $conexion->error]);
    }
    exit;
}

// --- PUT: RENOMBRAR DEPARTAMENTO EXISTENTE (SOLO ADMINISTRADOR GENERAL — ahora por ID) ---
if ($method == 'PUT') {
    if ($usuarioActual['nivel'] !== 'todos') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tienes permisos para editar departamentos"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $id          = intval($data['id'] ?? 0);
    $nombreNuevo = trim($data['nombre'] ?? '');

    if (!$data || $id <= 0 || $nombreNuevo === '') {
        echo json_encode(["success" => false, "error" => "Datos incompletos para actualizar"]);
        exit;
    }

    $nombreNuevo = $conexion->real_escape_string($nombreNuevo);

    // Verificar duplicados contra otros departamentos (excluyendo el mismo)
    $check = $conexion->query("SELECT id FROM departamentos WHERE LOWER(nombre) = LOWER('$nombreNuevo') AND id != $id");
    if ($check && $check->num_rows > 0) {
        echo json_encode(["success" => false, "error" => "Ya existe otro departamento con ese nombre"]);
        exit;
    }

    $sql = "UPDATE departamentos SET nombre = '$nombreNuevo' WHERE id = $id";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Departamento actualizado correctamente"]);
    } else {
        echo json_encode(["success" => false, "error" => $conexion->error]);
    }
    exit;
}

// --- DELETE: ELIMINAR DEPARTAMENTO (SOLO ADMINISTRADOR GENERAL — ahora por ID) ---
if ($method == 'DELETE') {
    if ($usuarioActual['nivel'] !== 'todos') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tienes permisos para eliminar departamentos"]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $id = intval($data['id'] ?? 0);

    if (!$data || $id <= 0) {
        echo json_encode(["success" => false, "error" => "No se especificó el departamento a eliminar"]);
        exit;
    }

    $sql = "DELETE FROM departamentos WHERE id = $id";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Departamento eliminado correctamente"]);
    } else {
        echo json_encode(["success" => false, "error" => $conexion->error]);
    }
    exit;
}
?>