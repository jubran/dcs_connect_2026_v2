<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

class BaseAuthController
{
    protected static ?array $currentUser = null;

    // ─── Authentication ───────────────────────────────────────────────────────

    public static function authenticate(): void
    {
        $token = self::getBearerToken();

        if (!$token) {
            self::errorResponse(401, 'Authorization token missing', [], 'TOKEN_MISSING');
        }

        $payload = decodeJWT($token, JWT_SECRET);

        if (!$payload) {
            self::errorResponse(401, 'Invalid or expired token', [], 'INVALID_TOKEN');
        }

        self::$currentUser = $payload;
    }

    public static function getCurrentUser(): array
    {
        if (!self::$currentUser) {
            self::errorResponse(401, 'Not authenticated', [], 'NOT_AUTHENTICATED');
        }
        return self::$currentUser;
    }

    public static function requireRole(string $requiredRole): void
    {
        $user = self::getCurrentUser();
        if (($user['u_role'] ?? 'user') !== $requiredRole) {
            self::errorResponse(403, 'Insufficient permissions', [
                'required' => $requiredRole,
                'current'  => $user['u_role'] ?? 'user',
            ], 'FORBIDDEN');
        }
    }

    // ─── Token Extraction ─────────────────────────────────────────────────────

    protected static function getBearerToken(): ?string
    {
        // 1. getallheaders()
        if (function_exists('getallheaders')) {
            foreach ((getallheaders() ?: []) as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    if (preg_match('/Bearer\s+(\S+)/i', $value, $m)) return $m[1];
                }
            }
        }

        // 2. $_SERVER
        foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION'] as $key) {
            if (!empty($_SERVER[$key])) {
                if (preg_match('/Bearer\s+(\S+)/i', $_SERVER[$key], $m)) return $m[1];
            }
        }

        // 3. x-access-token
        if (!empty($_SERVER['HTTP_X_ACCESS_TOKEN'])) {
            return $_SERVER['HTTP_X_ACCESS_TOKEN'];
        }

        return null;
    }

    // ─── Error Response ───────────────────────────────────────────────────────

    protected static function errorResponse(
        int $status,
        string $message,
        array $errors = [],
        ?string $code = null
    ): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success'   => false,
            'message'   => $message,
            'code'      => $code,
            'timestamp' => date('Y-m-d H:i:s'),
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        if ($status >= 500) {
            error_log("[$code] $message");
        }

        exit(json_encode($response));
    }

    // ─── Input Helpers ────────────────────────────────────────────────────────

    protected static function getJsonInput(): array
    {
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(400, 'Invalid JSON: ' . json_last_error_msg(), [], 'INVALID_JSON');
        }
        return $input ?? [];
    }

    protected static function requireMethod(string $method): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
            self::errorResponse(405, 'Method not allowed', [], 'METHOD_NOT_ALLOWED');
        }
    }

    protected static function validateFields(array $input, array $rules): array
    {
        $errors = [];
        foreach ($rules as $field => $type) {
            $value = $input[$field] ?? null;
            if ($value === null || trim((string)$value) === '') {
                $errors[$field] = "$field is required";
                continue;
            }
            switch ($type) {
                case 'date':
                    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value))
                        $errors[$field] = "$field must be YYYY-MM-DD";
                    break;
                case 'time':
                    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $value))
                        $errors[$field] = "$field must be HH:MM or HH:MM:SS";
                    break;
                case 'int':
                    if (!filter_var($value, FILTER_VALIDATE_INT))
                        $errors[$field] = "$field must be integer";
                    break;
                case 'string':
                    if (strlen(trim($value)) > 500)
                        $errors[$field] = "$field is too long";
                    break;
            }
        }
        return $errors;
    }

    protected static function s(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
    }
}
