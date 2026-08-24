<?php

$host = "localhost";
$user = "root";
$password = "";
$databse = "dar_miranda_db";


$conexion = new mysqli($host, $user, $password, $databse);

    if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->set_charset("utf8mb4");


?>