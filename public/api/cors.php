<?php

$allowedOrigins = [];

// في التطوير
if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
    $allowedOrigins = [
        'http://localhost:3030',
        'http://127.0.0.1:3030',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];
}

// أضف هنا domains الإنتاج
// $allowedOrigins[] = 'https://yourdomain.com';

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (!empty($allowedOrigins) && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
} elseif (empty($allowedOrigins)) {
    // إنتاج بدون CORS (نفس الدومين)
    // لا نضيف header
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
