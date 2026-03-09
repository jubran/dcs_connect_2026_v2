<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../cors.php';

class AuthController
{
    public static function fetchAuth()
    {
        global $conn;
        
        // Get cookie domain with fallback
        $cookieDomain = $_ENV['COOKIE_DOMAIN'] ?? '';
        
        // Detect request method
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
        } elseif ($method === 'GET') {
            $input = $_GET;
        } else {
            respondError(405, 'Method Not Allowed');
        }

        if (json_last_error() !== JSON_ERROR_NONE && $method === 'POST') {
            respondError(400, 'Invalid JSON');
        }

        if (empty($input['user_name']) || empty($input['password'])) {
            respondError(400, 'Username and password required');
        }

        $stmt = $conn->prepare(
            'SELECT id, user_name, user_password_hash, name, u_role FROM users WHERE user_name = :uname'
        );
        $stmt->execute(['uname' => $input['user_name']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Log failed attempt only if user not found
        if (!$user) {
            logSecurityEvent('failed_login', null, $_SERVER['REMOTE_ADDR']);
            respondError(401, 'Invalid credentials');
        }

        // Verify password
        if (!password_verify($input['password'], $user['user_password_hash'])) {
            logSecurityEvent('failed_login', $user['id'], $_SERVER['REMOTE_ADDR']);
            respondError(401, 'Invalid credentials');
        }

        // Generate tokens
        $accessToken = generateJWT(
            $user['id'],
            $user['user_name'],
            $user['name'],
            $user['u_role']
        );

        $refreshToken = generateRefreshToken($user['id']);

        // Set refresh token cookie
        setcookie(
            'refresh_token',
            $refreshToken,
            [
                'expires' => time() + (60 * 60 * 24 * 30),
                'path' => '/',
                'domain' => $cookieDomain ?: false,
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]
        );

        // Log successful login
        logSecurityEvent('successful_login', $user['id'], $_SERVER['REMOTE_ADDR']);

        echo json_encode([
            'user' => [
                'username' => $user['user_name'],
                'name' => $user['name'],
                'u_role' => $user['u_role'],
            ],
            'accessToken' => $accessToken,
        ]);
    }

    public static function register()
    {
        global $conn;
        $method = $_SERVER['REQUEST_METHOD'];

        if ($method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
        } elseif ($method === 'GET') {
            $input = $_GET;
        } else {
            respondError(405, 'Method Not Allowed');
        }

        if (json_last_error() !== JSON_ERROR_NONE && $method === 'POST') {
            respondError(400, 'Invalid JSON');
        }

        if (empty($input['user_name']) || empty($input['password'])) {
            respondError(400, 'Username and password required');
        }

        $hash = password_hash($input['password'], PASSWORD_BCRYPT);
        $stmt = $conn->prepare(
            'INSERT INTO users (user_name, user_password_hash) VALUES (:uname, :hash)'
        );
        $stmt->execute([
            'uname' => $input['user_name'],
            'hash' => $hash,
        ]);

        $uid = (int) $conn->lastInsertId();
        $token = generateJWT($uid, $input['user_name'], '', 'user');

        logSecurityEvent('user_registered', $uid, $_SERVER['REMOTE_ADDR']);

        echo json_encode([
            'user' => [
                'id' => $uid,
                'user_name' => $input['user_name'],
            ],
            'accessToken' => $token,
        ]);
    }

    public static function refreshToken()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            respondError(405, 'Method not allowed');
        }

        global $conn;

        if (empty($_COOKIE['refresh_token'])) {
            respondError(401, 'No refresh token');
        }

        $refreshToken = $_COOKIE['refresh_token'];
        $decoded = decodeJWT($refreshToken, REFRESH_SECRET);

        if (!$decoded) {
            respondError(401, 'Invalid refresh token');
        }

        if ($decoded['exp'] <= time()) {
            respondError(401, 'Refresh token expired');
        }

        // Get user data
        $stmt = $conn->prepare("SELECT id, user_name, name, u_role FROM users WHERE id = ?");
        $stmt->execute([$decoded['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            respondError(401, 'User not found');
        }

        // Generate new access token
        $accessToken = generateJWT(
            $user['id'],
            $user['user_name'],
            $user['name'],
            $user['u_role']
        );

        echo json_encode([
            'accessToken' => $accessToken,
            'user' => [
                'username' => $user['user_name'],
                'name' => $user['name'],
                'u_role' => $user['u_role'],
            ]
        ]);
    }

    public static function verifyToken()
    {
        global $conn;

        header('Content-Type: application/json');

        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            echo json_encode(['valid' => false, 'error' => 'No token provided']);
            return;
        }

        $token = $matches[1];
        $decoded = decodeJWT($token, JWT_SECRET);

        if (!$decoded) {
            echo json_encode(['valid' => false, 'error' => 'Invalid token']);
            return;
        }

        echo json_encode(['valid' => true, 'user' => $decoded]);
    }

    public static function hasRefresh()
    {
        if (empty($_COOKIE['refresh_token'])) {
            echo json_encode(['hasRefresh' => false]);
            return;
        }

        echo json_encode(['hasRefresh' => true]);
    }

    public static function logout()
    {
        setcookie('refresh_token', '', time() - 3600, '/');
        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }
}