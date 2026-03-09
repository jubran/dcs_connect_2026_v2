<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/BaseAuthController.php';

class UploadController extends BaseAuthController
{
    /**
     * رفع الملفات
     */
    public static function uploadFiles(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            self::errorResponse(
                405,
                'Method not allowed',
                [],
                'METHOD_NOT_ALLOWED'
            );
        }

        // تحقق من التوكن
        self::authenticate();

        $targetDir = __DIR__ . "/../uploads/operation/forms/";
        
        // Create directory if not exists
        if (!file_exists($targetDir)) {
            if (!mkdir($targetDir, 0755, true) && !is_dir($targetDir)) {
                self::errorResponse(
                    500,
                    'Failed to create upload directory',
                    [],
                    'DIRECTORY_CREATION_FAILED'
                );
            }
        }

        // Check if directory is writable
        if (!is_writable($targetDir)) {
            self::errorResponse(
                500,
                'Upload directory is not writable',
                [],
                'DIRECTORY_NOT_WRITABLE'
            );
        }

        if (!isset($_FILES['files'])) {
            self::errorResponse(
                400,
                'No files uploaded',
                [],
                'NO_FILES'
            );
        }

        $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'];
        $maxFileSize = 10 * 1024 * 1024; // 10MB
        $response = [];

        foreach ($_FILES['files']['name'] as $key => $name) {
            $tmpName = $_FILES['files']['tmp_name'][$key];
            $error = $_FILES['files']['error'][$key];
            $size = $_FILES['files']['size'][$key];

            // Check for upload errors
            if ($error !== UPLOAD_ERR_OK) {
                $response[] = [
                    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status' => 'error',
                    'message' => self::getUploadError($error)
                ];
                continue;
            }

            // Check file size
            if ($size > $maxFileSize) {
                $response[] = [
                    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status' => 'error',
                    'message' => 'File too large (max 10MB)'
                ];
                continue;
            }

            // Check file extension
            $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($extension, $allowedExtensions, true)) {
                $response[] = [
                    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status' => 'error',
                    'message' => 'File type not allowed'
                ];
                continue;
            }

            // Sanitize filename
            $safeFilename = self::sanitizeFilename($name);
            $targetFile = $targetDir . $safeFilename;

            // Prevent overwriting
            if (file_exists($targetFile)) {
                $safeFilename = time() . '_' . $safeFilename;
                $targetFile = $targetDir . $safeFilename;
            }

            // Move uploaded file
            if (move_uploaded_file($tmpName, $targetFile)) {
                $response[] = [
                    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'saved_as' => $safeFilename,
                    'size' => $size,
                    'status' => 'success',
                    'url' => '/uploads/operation/forms/' . $safeFilename
                ];
            } else {
                $response[] = [
                    'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status' => 'error',
                    'message' => 'Failed to save file'
                ];
            }
        }

        header('Content-Type: application/json');
        echo json_encode($response);
    }

    /**
     * قائمة الملفات
     */
    public static function listFiles(): void
    {
        // تحقق من التوكن
        self::authenticate();

        $dir = __DIR__ . "/../uploads/operation/forms/";
        
        if (!file_exists($dir) || !is_dir($dir)) {
            echo json_encode([]);
            return;
        }

        $files = [];
        $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'];

        foreach (scandir($dir) as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }
            
            $path = $dir . $file;
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            
            if (!in_array($extension, $allowedExtensions, true)) {
                continue;
            }

            if (!is_file($path)) {
                continue;
            }

            $files[] = [
                "name" => htmlspecialchars($file, ENT_QUOTES, 'UTF-8'),
                "type" => $extension,
                "size" => filesize($path),
                "modified" => date("Y-m-d H:i:s", filemtime($path)),
                "url" => '/uploads/operation/forms/' . urlencode($file)
            ];
        }

        // Sort by modification date (newest first)
        usort($files, function($a, $b) {
            return strtotime($b['modified']) - strtotime($a['modified']);
        });

        header('Content-Type: application/json');
        echo json_encode($files);
    }

    /* ====================
       PRIVATE HELPER FUNCTIONS
       ==================== */

    /**
     * الحصول على رسالة خطأ الرفع
     */
    private static function getUploadError(int $error): string
    {
        switch ($error) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return 'File too large';
            case UPLOAD_ERR_PARTIAL:
                return 'File partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'File upload stopped by extension';
            default:
                return 'Unknown upload error';
        }
    }

    /**
     * تنظيف أسماء الملفات
     */
    private static function sanitizeFilename(string $filename): string
    {
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
        $filename = preg_replace('/_+/', '_', $filename);
        $filename = trim($filename, '_');
        
        if (empty($filename)) {
            $filename = 'file_' . time();
        }
        
        return $filename;
    }
}
