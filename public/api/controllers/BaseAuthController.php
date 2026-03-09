<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../cors.php';

class BaseAuthController
{
    // المتغيرات الخاصة بالمستخدم الحالي
    protected static ?array $currentUser = null;

    /**
     * تحقق من التوكن وتخزين بيانات المستخدم
     */
    public static function authenticate(): void
    {
        $token = self::getBearerToken();
        
        if (!$token) {
            // Log debug info
            error_log("Token extraction failed. Request method: " . $_SERVER['REQUEST_METHOD']);
            error_log("Headers: " . json_encode(getallheaders() ?? []));
            error_log("_SERVER keys with AUTH: " . json_encode(array_filter(array_keys($_SERVER), function($k) { return strpos($k, 'AUTH') !== false; })));
            
            self::errorResponse(401, 'Token missing. Please provide Authorization header with Bearer token', [], 'TOKEN_MISSING');
        }
        
        self::$currentUser = self::validateJWT($token);
        
        if (!self::$currentUser) {
            self::errorResponse(401, 'Invalid or expired token', [], 'INVALID_TOKEN');
        }
    }

    /**
     * الحصول على بيانات المستخدم الحالي
     */
    public static function getCurrentUser(): array
    {
        if (!self::$currentUser) {
            self::errorResponse(401, 'Not authenticated', [], 'NOT_AUTHENTICATED');
        }
        return self::$currentUser;
    }

    /**
     * استخراج التوكن من الـ Header بعدة طرق
     */
    protected static function getBearerToken(): ?string
    {
        $authHeader = '';
        
        // الطريقة 1: استخدام getallheaders() - الأكثر موثوقية
        try {
            if (function_exists('getallheaders')) {
                $headers = getallheaders();
                if (is_array($headers)) {
                    // ابحث بحساسية الحالة المختلفة
                    foreach ($headers as $key => $value) {
                        if (strtolower($key) === 'authorization') {
                            $authHeader = $value;
                            break;
                        }
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Error in getallheaders(): " . $e->getMessage());
        }
        
        // الطريقة 2: البحث في $_SERVER
        if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        }
        
        // الطريقة 3: للخوادم التي تقوم بتعديل Authorization header
        if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        
        // الطريقة 4: البحث في x-access-token header (بديل شائع)
        if (!$authHeader && isset($_SERVER['HTTP_X_ACCESS_TOKEN'])) {
            return $_SERVER['HTTP_X_ACCESS_TOKEN'];
        }
        
        // البحث عن Bearer Token في Authorization header
        if (!empty($authHeader)) {
            // التعامل مع صيغ مختلفة للـ header
            if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
                return trim($matches[1]);
            }
            // في حالة كان التوكن مباشرة بدون "Bearer"
            if (preg_match('/^[A-Za-z0-9_\-\.]+$/', trim($authHeader))) {
                return trim($authHeader);
            }
        }
        
        // يمكن أيضاً البحث في الـ Query String (للتطوير فقط)
        if (isset($_GET['token']) && defined('DEV_MODE') && DEV_MODE) {
            return $_GET['token'];
        }
        
        return null;
    }

    /**
     * التحقق من صحة JWT
     */
    protected static function validateJWT(string $token): ?array
    {
        try {
            // تأكد من وجود JWT_SECRET في config.php
            if (!defined('JWT_SECRET')) {
                error_log('JWT_SECRET not defined in config.php');
                return null;
            }

            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                return null;
            }

            // Decode header
            $header = json_decode(base64_decode($parts[0]), true);
            if (!$header || ($header['alg'] ?? null) !== 'HS256') {
                return null;
            }

            // Decode payload
            $payload = json_decode(base64_decode($parts[1]), true);
            if (!$payload) {
                return null;
            }

            // Verify signature
            $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET, true);
            $expectedSignature = base64_encode($signature);
            $expectedSignature = rtrim(strtr($expectedSignature, '+/', '-_'), '=');

            if (!hash_equals($expectedSignature, $parts[2])) {
                return null;
            }

            // Check expiration
            if (isset($payload['exp']) && $payload['exp'] < time()) {
                return null;
            }

            return $payload;
        } catch (Exception $e) {
            error_log('JWT validation error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * دالة الرد على الأخطاء
     */
    protected static function errorResponse(
        int $status,
        string $message,
        array $errors = [],
        ?string $code = null
    ): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
            'code'    => $code,
            'timestamp' => date('Y-m-d H:i:s')
        ];

        if ($status >= 500) {
            error_log("Error [$code]: $message - " . json_encode($errors));
        }

        exit(json_encode($response));
    }
}
