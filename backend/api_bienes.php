<?php
include 'conexion.php';
include 'auth_check.php';
header('Content-Type: application/json; charset=utf-8');

$usuarioActual = requerirSesion();

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: OBTENER BIENES (area calculada en vivo desde departamentos) ---
if ($method == 'GET') {
    $tipo = $_GET['tipo'] ?? 'activos';

    $condicion = $tipo === 'baja' ? "b.fecha_baja IS NOT NULL" : "b.fecha_baja IS NULL";

    $sql = "SELECT b.*, 
                   CASE WHEN b.departamento_id IS NULL THEN b.area ELSE d.nombre END AS area
            FROM bienes b
            LEFT JOIN departamentos d ON b.departamento_id = d.id
            WHERE $condicion";

    $resultado = $conexion->query($sql);

    $bienes = [];
    while ($row = $resultado->fetch_assoc()) {
        $bienes[] = $row;
    }
    echo json_encode($bienes);
    exit;
} 

// --- POST: REGISTRAR NUEVO BIEN ---
if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        echo json_encode(["success" => false, "error" => "No se recibieron datos"]);
        exit;
    }

    $codigo = $conexion->real_escape_string($data['codigo'] ?? '');
    $descripcion = $conexion->real_escape_string($data['descripcion'] ?? '');
    $marca = $conexion->real_escape_string($data['marca'] ?? '');
    $modelo = $conexion->real_escape_string($data['modelo'] ?? '');
    $serial = $conexion->real_escape_string($data['serial'] ?? '');
    $ubicacion = $conexion->real_escape_string($data['ubicacion'] ?? '');
    $area = $conexion->real_escape_string($data['area'] ?? '');
    $estado = $conexion->real_escape_string($data['estado'] ?? 'Excelente');

    // Resolver departamento_id a partir del nombre recibido en "area"
    $resDep = $conexion->query("SELECT id FROM departamentos WHERE nombre = '$area'");
    if (!$resDep || $resDep->num_rows === 0) {
        echo json_encode(["success" => false, "error" => "El departamento/área indicado no existe"]);
        exit;
    }
    $departamentoId = intval($resDep->fetch_assoc()['id']);

    $sql = "INSERT INTO bienes (codigo, descripcion, marca, modelo, serial, ubicacion, area, departamento_id, estado) 
            VALUES ('$codigo', '$descripcion', '$marca', '$modelo', '$serial', '$ubicacion', '$area', $departamentoId, '$estado')";
    
    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Bien registrado correctamente"]);
    } else {
        error_log("Error MySQL en api_bienes.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
    }
    exit;
}

// --- PUT: ACTUALIZAR BIEN O DESINCORPORAR (PLANILLA BM-2) ---
if ($method == 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || empty($data['codigo'])) {
        echo json_encode(["success" => false, "error" => "No se recibieron datos válidos"]);
        exit;
    }

    $codigo = $conexion->real_escape_string($data['codigo']);
    $codigoOriginal = $conexion->real_escape_string($data['codigoOriginal'] ?? $data['codigo']);

    // Verificar si es una desincorporación
    if (isset($data['motivo']) || isset($data['oficio'])) {
        $motivo = $conexion->real_escape_string($data['motivo'] ?? '');
        $oficio = $conexion->real_escape_string($data['oficio'] ?? '');
        
        $sql = "UPDATE bienes SET motivo_baja = '$motivo', oficio_baja = '$oficio', fecha_baja = NOW() WHERE codigo = '$codigoOriginal' OR codigo = '$codigo'";
        
        if ($conexion->query($sql) === TRUE) {
            echo json_encode(["success" => true, "mensaje" => "Activo desincorporado correctamente"]);
        } else {
            error_log("Error MySQL en api_bienes.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
        }
    } else {
        // Actualización normal de datos
        $descripcion = $conexion->real_escape_string($data['descripcion'] ?? '');
        $marca = $conexion->real_escape_string($data['marca'] ?? '');
        $modelo = $conexion->real_escape_string($data['modelo'] ?? '');
        $serial = $conexion->real_escape_string($data['serial'] ?? '');
        $ubicacion = $conexion->real_escape_string($data['ubicacion'] ?? '');
        $area = $conexion->real_escape_string($data['area'] ?? '');
        $estado = $conexion->real_escape_string($data['estado'] ?? 'Excelente');

        // Resolver departamento_id a partir del nombre recibido en "area"
        $resDep = $conexion->query("SELECT id FROM departamentos WHERE nombre = '$area'");
        if (!$resDep || $resDep->num_rows === 0) {
            echo json_encode(["success" => false, "error" => "El departamento/área indicado no existe"]);
            exit;
        }
        $departamentoId = intval($resDep->fetch_assoc()['id']);

        $sql = "UPDATE bienes SET 
                codigo = '$codigo',
                descripcion = '$descripcion', 
                marca = '$marca', 
                modelo = '$modelo', 
                serial = '$serial', 
                ubicacion = '$ubicacion', 
                area = '$area', 
                departamento_id = $departamentoId,
                estado = '$estado' 
                WHERE codigo = '$codigoOriginal'";

        if ($conexion->query($sql) === TRUE) {
            echo json_encode(["success" => true, "mensaje" => "Activo actualizado correctamente"]);
        } else {
            error_log("Error MySQL en api_bienes.php: " . $conexion->error);
        echo json_encode(["success" => false, "error" => "Error interno del servidor. Intente nuevamente."]);
        }
    }
    exit;
}
?>