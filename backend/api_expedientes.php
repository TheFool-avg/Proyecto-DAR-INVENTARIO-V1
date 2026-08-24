<?php
include 'auth_check.php';   // arranca la sesión y da requerirSesion()
include 'conexion.php';
header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

// El correo YA NO se lee del cliente (GET/body) — se obtiene de la sesión
// del servidor, que no puede ser falsificada desde la consola del navegador.
$usuarioActual = requerirSesion(); // corta con 401 si no hay sesión activa

// --- VALIDAR QUE EL USUARIO PERTENEZCA A SERVICIOS JUDICIALES (O SEA ADMIN) ---
function usuarioAutorizado($conexion, $correo) {
    if (empty($correo)) return false;

    $correoEscapado = $conexion->real_escape_string($correo);
    $sql = "SELECT u.departamento_id, 
                   CASE WHEN u.departamento_id IS NULL THEN 'todos' ELSE d.nombre END AS nivel
            FROM usuarios u
            LEFT JOIN departamentos d ON u.departamento_id = d.id
            WHERE u.correo = '$correoEscapado'";

    $resultado = $conexion->query($sql);
    if (!$resultado || $resultado->num_rows === 0) return false;

    $usuario = $resultado->fetch_assoc();
    return $usuario['nivel'] === 'todos' || $usuario['nivel'] === 'Servicios Judiciales';
}

// --- GET: OBTENER EXPEDIENTES ---
if ($method == 'GET') {
    if (!usuarioAutorizado($conexion, $usuarioActual['correo'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tiene permisos para acceder a Expedientes"]);
        exit;
    }

    $tipo = $_GET['tipo'] ?? 'activos';

    if ($tipo === 'historial') {
        $resultado = $conexion->query("SELECT * FROM expedientes ORDER BY fecha_solicitud DESC");
    } else {
        $resultado = $conexion->query("SELECT * FROM expedientes WHERE estado = 'En Préstamo' ORDER BY fecha_solicitud DESC");
    }

    $expedientes = [];
    while ($row = $resultado->fetch_assoc()) {
        $expedientes[] = $row;
    }
    echo json_encode($expedientes);
    exit;
}

// --- POST: REGISTRAR NUEVO PRÉSTAMO DE EXPEDIENTE ---
if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !usuarioAutorizado($conexion, $usuarioActual['correo'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tiene permisos para gestionar Expedientes"]);
        exit;
    }

    $num = $conexion->real_escape_string(trim($data['num'] ?? ''));
    $asunto = $conexion->real_escape_string(trim($data['asunto'] ?? ''));
    $tribunal = $conexion->real_escape_string(trim($data['tribunal'] ?? ''));
    $oficio = $conexion->real_escape_string(trim($data['oficio'] ?? ''));
    $acta = $conexion->real_escape_string(trim($data['acta'] ?? ''));
    $alguacil = $conexion->real_escape_string(trim($data['alguacil'] ?? ''));
    $piezas = intval($data['piezas'] ?? 0);
    $observaciones = $conexion->real_escape_string(trim($data['observaciones'] ?? ''));

    if ($num === '' || $asunto === '' || $tribunal === '' || $oficio === '') {
        echo json_encode(["success" => false, "error" => "Faltan campos obligatorios"]);
        exit;
    }

    $check = $conexion->query("SELECT id FROM expedientes WHERE num_expediente = '$num'");
    if ($check && $check->num_rows > 0) {
        echo json_encode(["success" => false, "error" => "Ya existe un expediente con ese número"]);
        exit;
    }

    // departamento_id fijo: todos los expedientes son de Servicios Judiciales
    $depServJud = $conexion->query("SELECT id FROM departamentos WHERE nombre = 'Servicios Judiciales'");
    $depId = $depServJud && $depServJud->num_rows > 0 ? intval($depServJud->fetch_assoc()['id']) : 'NULL';

    $sql = "INSERT INTO expedientes (num_expediente, asunto, tribunal, numero_oficio, acta_remision, alguacil, num_piezas, observaciones, estado, departamento_id) 
            VALUES ('$num', '$asunto', '$tribunal', '$oficio', '$acta', '$alguacil', '$piezas', '$observaciones', 'En Préstamo', $depId)";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Préstamo de expediente registrado correctamente"]);
    } else {
        echo json_encode(["success" => false, "error" => $conexion->error]);
    }
    exit;
}

// --- PUT: ACTUALIZAR EXPEDIENTE O MARCAR COMO DEVUELTO ---
if ($method == 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !usuarioAutorizado($conexion, $usuarioActual['correo'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tiene permisos para gestionar Expedientes"]);
        exit;
    }

    if (empty($data['num'])) {
        echo json_encode(["success" => false, "error" => "No se recibieron datos válidos"]);
        exit;
    }

    $num = $conexion->real_escape_string(trim($data['num']));
    $numOriginal = $conexion->real_escape_string(trim($data['numOriginal'] ?? $data['num']));

    // --- CASO 1: DEVOLVER EXPEDIENTE (baja lógica de estado) ---
    if (isset($data['accion']) && $data['accion'] === 'devolver') {
        $sql = "UPDATE expedientes SET estado = 'Devuelto' WHERE num_expediente = '$numOriginal'";

        if ($conexion->query($sql) === TRUE) {
            echo json_encode(["success" => true, "mensaje" => "Expediente marcado como devuelto"]);
        } else {
            echo json_encode(["success" => false, "error" => $conexion->error]);
        }
        exit;
    }

    // --- CASO 2: ACTUALIZACIÓN NORMAL DE DATOS ---
    $asunto = $conexion->real_escape_string(trim($data['asunto'] ?? ''));
    $tribunal = $conexion->real_escape_string(trim($data['tribunal'] ?? ''));
    $oficio = $conexion->real_escape_string(trim($data['oficio'] ?? ''));
    $acta = $conexion->real_escape_string(trim($data['acta'] ?? ''));
    $alguacil = $conexion->real_escape_string(trim($data['alguacil'] ?? ''));
    $piezas = intval($data['piezas'] ?? 0);
    $observaciones = $conexion->real_escape_string(trim($data['observaciones'] ?? ''));

    $sql = "UPDATE expedientes SET 
            num_expediente = '$num',
            asunto = '$asunto', 
            tribunal = '$tribunal', 
            numero_oficio = '$oficio', 
            acta_remision = '$acta', 
            alguacil = '$alguacil', 
            num_piezas = '$piezas', 
            observaciones = '$observaciones'
            WHERE num_expediente = '$numOriginal'";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Expediente actualizado correctamente"]);
    } else {
        echo json_encode(["success" => false, "error" => $conexion->error]);
    }
    exit;
}

// --- DELETE: ELIMINAR EXPEDIENTE (borrado físico, uso excepcional) ---
if ($method == 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !usuarioAutorizado($conexion, $usuarioActual['correo'])) {
        http_response_code(403);
        echo json_encode(["success" => false, "error" => "No tiene permisos para gestionar Expedientes"]);
        exit;
    }

    if (empty($data['num'])) {
        echo json_encode(["success" => false, "error" => "No se especificó el expediente a eliminar"]);
        exit;
    }

    $num = $conexion->real_escape_string(trim($data['num']));
    $sql = "DELETE FROM expedientes WHERE num_expediente = '$num'";

    if ($conexion->query($sql) === TRUE) {
        echo json_encode(["success" => true, "mensaje" => "Expediente eliminado correctamente"]);
    } else {
        echo json_encode(["success" => false, "error" => $conexion->error]);
    }
    exit;
}
?>