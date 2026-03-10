<?php

// ─── تحميل .env ────────────────────────────────────────────────────────────
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// ─── JWT ────────────────────────────────────────────────────────────────────
$jwtSecret     = $_ENV['JWT_SECRET']     ?? null;
$refreshSecret = $_ENV['REFRESH_SECRET'] ?? null;

if (empty($jwtSecret) || empty($refreshSecret)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}

define('JWT_SECRET',     $jwtSecret);
define('REFRESH_SECRET', $refreshSecret);
define('JWT_ALGO',       'HS256');
define('APP_ENV',        $_ENV['APP_ENV'] ?? 'production');

// ─── قاعدة البيانات ──────────────────────────────────────────────────────────
// المسار خارج public/ تماماً - غير قابل للوصول من المتصفح
$dbPath = realpath(__DIR__ . '/../../database/dcsVite.sqlite3');

if (!$dbPath || !file_exists($dbPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Database not found']);
    exit;
}

try {
    $conn = new PDO('sqlite:' . $dbPath);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // تحسين أداء SQLite
    $conn->exec('PRAGMA journal_mode=WAL');
    $conn->exec('PRAGMA foreign_keys=ON');
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}
