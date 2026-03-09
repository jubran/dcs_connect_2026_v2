<?php
// 📌 اسمح لـ React/Vite origin
$allowedOrigins = [
    'http://localhost:3030',  // React dev server
    'http://127.0.0.1:3030',  // بديل localhost
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true"); // إذا تستخدم الكوكيز

// ⚡ Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}