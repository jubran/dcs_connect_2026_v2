<?php 
require_once __DIR__ . '/cors.php';

define('JWT_SECRET', '8c8f978df2bd7857afb4d080298161a36c305ffabbb361b89d43b5d24f01b834!');
define('JWT_ALGO', 'HS256');

define('REFRESH_SECRET', 'REFRESH_SECRET=3524815b618668cb68b1f3e9d1bd995822081687214265f12f4e75c0771ff5d316283294ce328eb32e6e53ad4d76c0c3e2dae2b3b161d01be9b8d421452a699
');

try {
    $conn = new PDO('sqlite:' . __DIR__ . '/../dcsVite.sqlite3');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}
