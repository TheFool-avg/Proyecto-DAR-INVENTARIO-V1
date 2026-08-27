<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/auth_check.php';

$usuarioActual = requerirSesion();

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    // Paginación
    $pagina = isset($_GET['pagina']) ? max(1, intval($_GET['pagina'])) : 1;
    $porPagina = isset($_GET['por_pagina']) ? max(1, intval($_GET['por_pagina'])) : 20;
    $offset = ($pagina - 1) * $porPagina;

    // Filtros opcionales
    $condiciones = [];
    if (!empty($_GET['fecha_desde'])) {
        $fechaDesde = $conexion->real_escape_string($_GET['fecha_desde']);
        $condiciones[] = "fecha_hora >= '$fechaDesde 00:00:00'";
    }
    if (!empty($_GET['fecha_hasta'])) {
        $fechaHasta = $conexion->real_escape_string($_GET['fecha_hasta']);
        $condiciones[] = "fecha_hora <= '$fechaHasta 23:59:59'";
    }
    if (!empty($_GET['usuario'])) {
        $usuarioFiltro = $conexion->real_escape_string($_GET['usuario']);
        $condiciones[] = "usuario LIKE '%$usuarioFiltro%'";
    }

    $where = count($condiciones) > 0 ? 'WHERE ' . implode(' AND ', $condiciones) : '';

    // Total de registros (para calcular páginas en el frontend)
    $resTotal = $conexion->query("SELECT COUNT(*) AS total FROM auditoria $where");
    $total = $resTotal ? intval($resTotal->fetch_assoc()['total']) : 0;

    // Registros de la página actual, más recientes primero
    $sql = "SELECT id, fecha_hora, usuario, operacion, descripcion
            FROM auditoria $where
            ORDER BY fecha_hora DESC
            LIMIT $porPagina OFFSET $offset";
    $resultado = $conexion->query($sql);

    $registros = [];
    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $registros[] = $fila;
        }
    }

    echo json_encode([
        "success" => true,
        "registros" => $registros,
        "total" => $total,
        "pagina" => $pagina,
        "por_pagina" => $porPagina,
        "total_paginas" => $porPagina > 0 ? ceil($total / $porPagina) : 1
    ]);
    exit;
}

if ($metodo === 'POST') {
    $datos = json_decode(file_get_contents("php://input"), true);

    $usuario = isset($datos['usuario']) ? $conexion->real_escape_string($datos['usuario']) : '';
    $operacion = isset($datos['operacion']) ? $conexion->real_escape_string($datos['operacion']) : '';
    $descripcion = isset($datos['descripcion']) ? $conexion->real_escape_string($datos['descripcion']) : '';

    if ($usuario === '' || $operacion === '') {
        echo json_encode(["success" => false, "error" => "Faltan datos obligatorios (usuario u operación)"]);
        exit;
    }

    $sql = "INSERT INTO auditoria (fecha_hora, usuario, operacion, descripcion)
            VALUES (NOW(), '$usuario', '$operacion', '$descripcion')";

    if ($conexion->query($sql)) {
        echo json_encode(["success" => true, "mensaje" => "Registro de auditoría guardado"]);
    } else {
        error_log("Error MySQL en api_auditoria.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
    }
    exit;
}

if ($metodo === 'DELETE') {
    if ($usuarioActual['nivel'] !== 'todos') {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tienes permisos para limpiar el historial de auditoría"]);
        exit;
    }

    if ($conexion->query("TRUNCATE TABLE auditoria")) {
        echo json_encode(["success" => true, "mensaje" => "Historial de auditoría vaciado correctamente"]);
    } else {
        error_log("Error MySQL en api_auditoria.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
    }
    exit;
}

echo json_encode(["success" => false, "error" => "Método no permitido"]);