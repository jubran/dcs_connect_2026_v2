<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/BaseAuthController.php';

class AuthController extends BaseAuthController
{
    public static function fetchAuth(): void
    {
        global $conn;

        $input = $_SERVER['REQUEST_METHOD'] === 'POST'
            ? self::getJsonInput()
            : $_GET;

        if (empty($input['user_name']) || empty($input['password'])) {
            self::errorResponse(400, 'Username and password required', [], 'MISSING_CREDENTIALS');
        }

        $stmt = $conn->prepare(
            'SELECT id, user_name, user_password_hash, name, u_role FROM users WHERE user_name = :uname'
        );
        $stmt->execute(['uname' => $input['user_name']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($input['password'], $user['user_password_hash'])) {
            logSecurityEvent('failed_login', $user['id'] ?? null);
            self::errorResponse(401, 'Invalid credentials', [], 'INVALID_CREDENTIALS');
        }

        $accessToken  = generateJWT($user['id'], $user['user_name'], $user['name'], $user['u_role']);
        $refreshToken = generateRefreshToken($user['id']);

        $cookieDomain = $_ENV['COOKIE_DOMAIN'] ?? '';

        // secure=true فقط إذا الخادم يعمل على HTTPS فعلاً
        $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
                || ($_SERVER['SERVER_PORT'] ?? 80) == 443;

        setcookie('refresh_token', $refreshToken, [
            'expires'  => time() + (60 * 60 * 24 * 30),
            'path'     => '/',
            'domain'   => $cookieDomain ?: '',
            'secure'   => $isHttps,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        logSecurityEvent('successful_login', $user['id']);

        echo json_encode([
            'user' => [
                'username' => $user['user_name'],
                'name'     => $user['name'],
                'u_role'   => $user['u_role'],
            ],
            'accessToken' => $accessToken,
        ]);
    }

    public static function register(): void
    {
        global $conn;

        $input = $_SERVER['REQUEST_METHOD'] === 'POST'
            ? self::getJsonInput()
            : $_GET;

        if (empty($input['user_name']) || empty($input['password'])) {
            self::errorResponse(400, 'Username and password required', [], 'MISSING_FIELDS');
        }

        if (strlen($input['password']) < 8) {
            self::errorResponse(422, 'Password must be at least 8 characters', [], 'WEAK_PASSWORD');
        }

        $check = $conn->prepare('SELECT id FROM users WHERE user_name = :uname');
        $check->execute(['uname' => $input['user_name']]);
        if ($check->fetch()) {
            self::errorResponse(409, 'Username already exists', [], 'DUPLICATE_USER');
        }

        $hash = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $conn->prepare(
            'INSERT INTO users (user_name, user_password_hash, name, u_role) VALUES (:uname, :hash, :name, :role)'
        );
        $stmt->execute([
            'uname' => $input['user_name'],
            'hash'  => $hash,
            'name'  => $input['name'] ?? $input['user_name'],
            'role'  => 'user',
        ]);

        $uid   = (int) $conn->lastInsertId();
        $token = generateJWT($uid, $input['user_name'], $input['name'] ?? $input['user_name'], 'user');

        logSecurityEvent('user_registered', $uid);

        http_response_code(201);
        echo json_encode([
            'user'        => ['id' => $uid, 'user_name' => $input['user_name']],
            'accessToken' => $token,
        ]);
    }

    public static function refreshToken(): void
    {
        global $conn;

        self::requireMethod('POST');

        if (empty($_COOKIE['refresh_token'])) {
            self::errorResponse(401, 'No refresh token', [], 'NO_REFRESH_TOKEN');
        }

        $payload = decodeJWT($_COOKIE['refresh_token'], REFRESH_SECRET);

        if (!$payload) {
            self::errorResponse(401, 'Invalid or expired refresh token', [], 'INVALID_REFRESH_TOKEN');
        }

        $stmt = $conn->prepare('SELECT id, user_name, name, u_role FROM users WHERE id = ?');
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();

        if (!$user) {
            self::errorResponse(401, 'User not found', [], 'USER_NOT_FOUND');
        }

        $accessToken = generateJWT($user['id'], $user['user_name'], $user['name'], $user['u_role']);

        echo json_encode([
            'accessToken' => $accessToken,
            'user'        => [
                'username' => $user['user_name'],
                'name'     => $user['name'],
                'u_role'   => $user['u_role'],
            ],
        ]);
    }

    public static function verifyToken(): void
    {
        $token = self::getBearerToken();

        if (!$token) {
            echo json_encode(['valid' => false, 'error' => 'No token']);
            return;
        }

        $payload = decodeJWT($token, JWT_SECRET);

        echo json_encode($payload
            ? ['valid' => true,  'user' => $payload]
            : ['valid' => false, 'error' => 'Invalid token']
        );
    }

    public static function hasRefresh(): void
    {
        echo json_encode(['hasRefresh' => !empty($_COOKIE['refresh_token'])]);
    }

    public static function logout(): void
    {
        setcookie('refresh_token', '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }
}