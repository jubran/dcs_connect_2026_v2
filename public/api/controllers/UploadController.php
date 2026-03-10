<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/BaseAuthController.php';

class UploadController extends BaseAuthController
{
    private const UPLOAD_DIR       = __DIR__ . '/../../uploads/operation/forms/';
    private const ALLOWED_EXT      = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'];
    private const MAX_FILE_SIZE    = 10 * 1024 * 1024; // 10MB

    // ─── Upload ───────────────────────────────────────────────────────────────

    public static function uploadFiles(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $dir = self::UPLOAD_DIR;
        if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
            self::errorResponse(500, 'Cannot create upload directory', [], 'DIR_FAILED');
        }
        if (!is_writable($dir)) {
            self::errorResponse(500, 'Upload directory not writable', [], 'NOT_WRITABLE');
        }
        if (!isset($_FILES['files'])) {
            self::errorResponse(400, 'No files provided', [], 'NO_FILES');
        }

        $results = [];
        foreach ($_FILES['files']['name'] as $i => $name) {
            $results[] = self::processUpload(
                $name,
                $_FILES['files']['tmp_name'][$i],
                $_FILES['files']['error'][$i],
                $_FILES['files']['size'][$i],
                $dir
            );
        }

        echo json_encode($results);
    }

    // ─── List ─────────────────────────────────────────────────────────────────

    public static function listFiles(): void
    {
        self::authenticate();

        $dir = self::UPLOAD_DIR;
        if (!is_dir($dir)) { echo json_encode([]); return; }

        $files = [];
        foreach (scandir($dir) as $file) {
            if ($file[0] === '.') continue;
            $path = $dir . $file;
            $ext  = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!is_file($path) || !in_array($ext, self::ALLOWED_EXT, true)) continue;
            $files[] = [
                'name'     => htmlspecialchars($file, ENT_QUOTES, 'UTF-8'),
                'type'     => $ext,
                'size'     => filesize($path),
                'modified' => date('Y-m-d H:i:s', filemtime($path)),
                'url'      => '/uploads/operation/forms/' . rawurlencode($file),
            ];
        }

        usort($files, fn($a, $b) => strtotime($b['modified']) - strtotime($a['modified']));
        echo json_encode($files);
    }

    // ─── Download ─────────────────────────────────────────────────────────────

    public static function downloadFile(): void
    {
        self::authenticate();

        $filename = basename($_GET['filename'] ?? '');
        if (!$filename) {
            self::errorResponse(400, 'Filename required', [], 'MISSING_FILENAME');
        }

        $path = self::UPLOAD_DIR . $filename;
        if (!file_exists($path) || !is_file($path)) {
            self::errorResponse(404, 'File not found', [], 'FILE_NOT_FOUND');
        }

        $ext  = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXT, true)) {
            self::errorResponse(403, 'File type not allowed', [], 'FORBIDDEN_TYPE');
        }

        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        header('Content-Length: ' . filesize($path));
        readfile($path);
        exit;
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    public static function deleteFile(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input    = self::getJsonInput();
        $filename = basename($input['filename'] ?? '');

        if (!$filename) {
            self::errorResponse(400, 'Filename required', [], 'MISSING_FILENAME');
        }

        $path = self::UPLOAD_DIR . $filename;
        if (!file_exists($path)) {
            self::errorResponse(404, 'File not found', [], 'FILE_NOT_FOUND');
        }

        if (!unlink($path)) {
            self::errorResponse(500, 'Could not delete file', [], 'DELETE_FAILED');
        }

        echo json_encode(['success' => true, 'message' => "Deleted: $filename"]);
    }

    // ─── Private ──────────────────────────────────────────────────────────────

    private static function processUpload(string $name, string $tmp, int $error, int $size, string $dir): array
    {
        $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

        if ($error !== UPLOAD_ERR_OK) {
            return ['name' => $safeName, 'status' => 'error', 'message' => self::uploadErrorMsg($error)];
        }
        if ($size > self::MAX_FILE_SIZE) {
            return ['name' => $safeName, 'status' => 'error', 'message' => 'File too large (max 10MB)'];
        }

        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXT, true)) {
            return ['name' => $safeName, 'status' => 'error', 'message' => 'File type not allowed'];
        }

        $saved = self::sanitizeFilename($name);
        $path  = $dir . $saved;
        if (file_exists($path)) {
            $saved = time() . '_' . $saved;
            $path  = $dir . $saved;
        }

        if (!move_uploaded_file($tmp, $path)) {
            return ['name' => $safeName, 'status' => 'error', 'message' => 'Failed to save file'];
        }

        return [
            'name'     => $safeName,
            'saved_as' => $saved,
            'size'     => $size,
            'status'   => 'success',
            'url'      => '/uploads/operation/forms/' . rawurlencode($saved),
        ];
    }

    private static function sanitizeFilename(string $name): string
    {
        $name = preg_replace('/[^a-zA-Z0-9._-]/', '_', $name);
        $name = preg_replace('/_+/', '_', $name);
        $name = trim($name, '_');
        return $name ?: 'file_' . time();
    }

    private static function uploadErrorMsg(int $code): string
    {
        return match ($code) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File too large',
            UPLOAD_ERR_PARTIAL  => 'File partially uploaded',
            UPLOAD_ERR_NO_FILE  => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'No temp directory',
            UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
            default => 'Unknown upload error',
        };
    }
}
