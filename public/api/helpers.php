<?php
require_once __DIR__ . '/cors.php';

/**
 * Validate a JWT token and optionally refresh it.
 *
 * @param string $token The JWT token to validate
 * @return string New JWT token if valid, otherwise exits with JSON error
 */

function respondError(int $code, string $msg) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

function generateJWT($user_id, $username, $name, $u_role): string {
    $header = base64UrlEncode(json_encode([
        'typ' => 'JWT',
        'alg' => 'HS256'
    ]));

    $payload = base64UrlEncode(json_encode([
        'user_id' => $user_id,
        'username' => $username,
        'name' => $name,
        'u_role' => $u_role,
        'iat' => time(),
        'exp' => time() + (15 * 60) // 15 دقيقة
    ]));

    $signature = base64UrlEncode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    return "$header.$payload.$signature";
}

function decodeJWT(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $signature] = $parts;

    $validSignature = base64UrlEncode(
        hash_hmac('sha256', "$header.$payload", $secret, true)
    );

    if (!hash_equals($validSignature, $signature)) {
        return null;
    }

    return json_decode(base64UrlDecode($payload), true);
}

function validateJWT(string $token): array
{
    $payload = decodeJWT($token, JWT_SECRET);

    if (!$payload) {
        respondError(401, 'Invalid token');
    }

    if (!isset($payload['exp']) || $payload['exp'] < time()) {
        respondError(401, 'Token expired');
    }

    return $payload;
}

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateRefreshToken(int $userId): string
{
    $header = base64UrlEncode(json_encode([
        'typ' => 'JWT',
        'alg' => 'HS256'
    ]));

    $payload = base64UrlEncode(json_encode([
        'user_id' => $userId,
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24 * 30) // 30 يوم
    ]));

    $signature = base64UrlEncode(
        hash_hmac('sha256', "$header.$payload", REFRESH_SECRET, true)
    );

    return "$header.$payload.$signature";
}
function logSecurityEvent($event, $userId = null, $ip = null) {
    global $conn;
    $ip = $ip ?? $_SERVER['REMOTE_ADDR'];
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $stmt = $conn->prepare(
        "INSERT INTO security_logs (event, user_id, ip, user_agent, timestamp) 
         VALUES (?, ?, ?, ?, datetime('now'))"
    );
    $stmt->execute([$event, $userId, $ip, $userAgent]);
}


function fetchData(PDO $db, string $query, array $params = []): array {
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getBearerToken(): ?string
{
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        return null;
    }

    if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
        return $matches[1];
    }

    return null;
}


