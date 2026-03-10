<?php

// ─── Response Helpers ────────────────────────────────────────────────────────

function respondError(int $code, string $msg): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['error' => $msg]);
    exit;
}

function respondSuccess(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// ─── JWT ────────────────────────────────────────────────────────────────────

function generateJWT(int $userId, string $username, string $name, string $role): string
{
    $header  = base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64UrlEncode(json_encode([
        'user_id'  => $userId,
        'username' => $username,
        'name'     => $name,
        'u_role'   => $role,
        'iat'      => time(),
        'exp'      => time() + (15 * 60), // 15 دقيقة
    ]));
    $sig = base64UrlEncode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    return "$header.$payload.$sig";
}

function generateRefreshToken(int $userId): string
{
    $header  = base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64UrlEncode(json_encode([
        'user_id' => $userId,
        'iat'     => time(),
        'exp'     => time() + (60 * 60 * 24 * 30), // 30 يوم
    ]));
    $sig = base64UrlEncode(hash_hmac('sha256', "$header.$payload", REFRESH_SECRET, true));
    return "$header.$payload.$sig";
}

function decodeJWT(string $token, string $secret): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $signature] = $parts;

    $expected = base64UrlEncode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($expected, $signature)) return null;

    $data = json_decode(base64UrlDecode($payload), true);
    if (!$data) return null;

    // تحقق من انتهاء الصلاحية
    if (isset($data['exp']) && $data['exp'] < time()) return null;

    return $data;
}

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

// ─── Database Helper ─────────────────────────────────────────────────────────

function fetchData(PDO $db, string $query, array $params = []): array
{
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// ─── Security Logger ─────────────────────────────────────────────────────────

function logSecurityEvent(string $event, ?int $userId = null, ?string $ip = null): void
{
    global $conn;
    try {
        $stmt = $conn->prepare(
            "INSERT INTO security_logs (event, user_id, ip, user_agent, timestamp)
             VALUES (?, ?, ?, ?, datetime('now'))"
        );
        $stmt->execute([
            $event,
            $userId,
            $ip ?? $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? '',
        ]);
    } catch (PDOException $e) {
        // لا نوقف التطبيق بسبب فشل اللوغ
        error_log('Security log failed: ' . $e->getMessage());
    }
}
