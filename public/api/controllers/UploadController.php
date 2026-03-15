<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/BaseAuthController.php';

class UploadController extends BaseAuthController
{
    private const BASE_DIR      = __DIR__ . '/../../uploads/operation/forms/';
    private const ALLOWED_EXT   = ['pdf','doc','docx','xls','xlsx','jpg','jpeg','png','gif','mp4','mp3','webp','svg','csv','txt'];
    private const MAX_SIZE      = 20 * 1024 * 1024; // 20 MB

    // ══════════════════════════════════════════════════════════════════════════
    //  FILES
    // ══════════════════════════════════════════════════════════════════════════

    // ─── Upload (multipart) ───────────────────────────────────────────────────
    public static function uploadFiles(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $folder = self::sanitizeFolderName($_POST['folder'] ?? '');
        $dir    = self::resolveDir($folder);
        self::ensureDir($dir);

        if (empty($_FILES['files']) && empty($_FILES['files[]'])) {
            self::errorResponse(400, 'No files provided', [], 'NO_FILES');
        }

        $fileInput = !empty($_FILES['files[]']) ? $_FILES['files[]'] : $_FILES['files'];
        // Normalize to array
        if (!is_array($fileInput['name'])) {
            foreach ($fileInput as $k => $v) $fileInput[$k] = [$v];
        }

        $results = [];
        foreach ($fileInput['name'] as $i => $name) {
            $results[] = self::processUpload(
                $name,
                $fileInput['tmp_name'][$i],
                $fileInput['error'][$i],
                $fileInput['size'][$i],
                $dir,
                $folder
            );
        }

        echo json_encode($results);
    }

    // ─── List files in a folder ────────────────────────────────────────────────
    public static function listFiles(): void
    {
        self::authenticate();
        $folder = self::sanitizeFolderName($_GET['folder'] ?? '');
        $dir    = self::resolveDir($folder);

        if (!is_dir($dir)) { echo json_encode([]); return; }

        echo json_encode(self::scanFiles($dir, $folder));
    }

    // ─── List ALL files (merged, sorted by modified DESC) ─────────────────────
    public static function listAllFiles(): void
    {
        self::authenticate();
        $folder = self::sanitizeFolderName($_GET['folder'] ?? '');

        if ($folder) {
            $dir = self::resolveDir($folder);
            echo json_encode(self::scanFiles($dir, $folder));
            return;
        }

        // Walk all subdirs + root
        $all  = self::scanFiles(self::BASE_DIR, '');
        $dirs = is_dir(self::BASE_DIR) ? scandir(self::BASE_DIR) : [];
        foreach ($dirs as $d) {
            if ($d[0] === '.') continue;
            $sub = self::BASE_DIR . $d;
            if (!is_dir($sub)) continue;
            foreach (self::scanFiles($sub . '/', $d) as $f) {
                $all[] = $f;
            }
        }

        usort($all, fn($a, $b) => strtotime($b['modified']) - strtotime($a['modified']));
        echo json_encode($all);
    }

    // ─── Download ─────────────────────────────────────────────────────────────
    public static function downloadFile(): void
    {
        self::authenticate();

        $filename = basename($_GET['filename'] ?? '');
        $folder   = self::sanitizeFolderName($_GET['folder'] ?? '');
        if (!$filename) self::errorResponse(400, 'Filename required', [], 'MISSING');

        $path = self::resolveDir($folder) . $filename;
        if (!file_exists($path) || !is_file($path))
            self::errorResponse(404, 'File not found', [], 'NOT_FOUND');

        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXT, true))
            self::errorResponse(403, 'File type not allowed', [], 'FORBIDDEN');

        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . addslashes($filename) . '"');
        header('Content-Length: ' . filesize($path));
        readfile($path);
        exit;
    }

    // ─── Delete file ──────────────────────────────────────────────────────────
    public static function deleteFile(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input    = self::getJsonInput();
        $filename = basename($input['filename'] ?? '');
        $folder   = self::sanitizeFolderName($input['folder'] ?? '');

        if (!$filename) self::errorResponse(400, 'Filename required', [], 'MISSING');

        $path = self::resolveDir($folder) . $filename;
        if (!file_exists($path)) self::errorResponse(404, 'File not found', [], 'NOT_FOUND');
        if (!unlink($path))      self::errorResponse(500, 'Cannot delete file', [], 'DELETE_FAILED');

        echo json_encode(['success' => true, 'message' => "Deleted: $filename"]);
    }

    // ─── Rename file ──────────────────────────────────────────────────────────
    public static function renameFile(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input   = self::getJsonInput();
        $old     = basename($input['old_name'] ?? '');
        $new     = basename($input['new_name'] ?? '');
        $folder  = self::sanitizeFolderName($input['folder'] ?? '');

        if (!$old || !$new) self::errorResponse(400, 'old_name and new_name required', [], 'MISSING');

        $dir     = self::resolveDir($folder);
        $oldPath = $dir . $old;
        $newPath = $dir . self::sanitizeFilename($new);

        if (!file_exists($oldPath)) self::errorResponse(404, 'File not found', [], 'NOT_FOUND');
        if (file_exists($newPath))  self::errorResponse(409, 'Name already exists', [], 'CONFLICT');
        if (!rename($oldPath, $newPath)) self::errorResponse(500, 'Rename failed', [], 'RENAME_FAILED');

        echo json_encode(['success' => true, 'new_name' => basename($newPath)]);
    }

    // ─── Move file to folder ──────────────────────────────────────────────────
    public static function moveFile(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input      = self::getJsonInput();
        $filename   = basename($input['filename']    ?? '');
        $fromFolder = self::sanitizeFolderName($input['from_folder'] ?? '');
        $toFolder   = self::sanitizeFolderName($input['to_folder']   ?? '');

        if (!$filename) self::errorResponse(400, 'filename required', [], 'MISSING');

        $src = self::resolveDir($fromFolder) . $filename;
        $dst = self::resolveDir($toFolder);
        self::ensureDir($dst);

        if (!file_exists($src)) self::errorResponse(404, 'File not found', [], 'NOT_FOUND');
        if (!rename($src, $dst . $filename)) self::errorResponse(500, 'Move failed', [], 'MOVE_FAILED');

        echo json_encode(['success' => true]);
    }

    // ─── Star / unstar (stores in a JSON sidecar) ────────────────────────────
    public static function starFile(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input    = self::getJsonInput();
        $filename = basename($input['filename'] ?? '');
        $folder   = self::sanitizeFolderName($input['folder'] ?? '');
        $starred  = (bool)($input['starred'] ?? false);

        if (!$filename) self::errorResponse(400, 'filename required', [], 'MISSING');

        $metaFile = self::resolveDir($folder) . '.meta.json';
        $meta     = file_exists($metaFile) ? json_decode(file_get_contents($metaFile), true) : [];
        $meta[$filename]['starred'] = $starred;
        file_put_contents($metaFile, json_encode($meta));

        echo json_encode(['success' => true, 'starred' => $starred]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  FOLDERS
    // ══════════════════════════════════════════════════════════════════════════

    // ─── List folders ─────────────────────────────────────────────────────────
    public static function listFolders(): void
    {
        self::authenticate();
        $base    = self::BASE_DIR;
        $folders = [];

        if (!is_dir($base)) { echo json_encode([]); return; }

        foreach (scandir($base) as $entry) {
            if ($entry[0] === '.') continue;
            $path = $base . $entry;
            if (!is_dir($path)) continue;

            $meta      = self::readMeta($path . '/');
            $fileCount = count(array_filter(scandir($path),
                fn($f) => $f[0] !== '.' && is_file($path . '/' . $f)));
            $size      = self::dirSize($path);

            $folders[] = [
                'name'      => $entry,
                'fileCount' => $fileCount,
                'size'      => $size,
                'starred'   => $meta['.folder']['starred'] ?? false,
                'modified'  => date('Y-m-d H:i:s', filemtime($path)),
                'shared'    => [],
            ];
        }

        echo json_encode($folders);
    }

    // ─── Create folder ────────────────────────────────────────────────────────
    public static function createFolder(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input = self::getJsonInput();
        $name  = self::sanitizeFolderName($input['name'] ?? '');

        if (!$name) self::errorResponse(400, 'Folder name required', [], 'MISSING');

        $path = self::BASE_DIR . $name;
        if (is_dir($path)) self::errorResponse(409, 'Folder already exists', [], 'CONFLICT');

        self::ensureDir($path . '/');
        echo json_encode(['success' => true, 'name' => $name]);
    }

    // ─── Delete folder ────────────────────────────────────────────────────────
    public static function deleteFolder(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input = self::getJsonInput();
        $name  = self::sanitizeFolderName($input['name'] ?? '');

        if (!$name) self::errorResponse(400, 'Folder name required', [], 'MISSING');

        $path = self::BASE_DIR . $name;
        if (!is_dir($path)) self::errorResponse(404, 'Folder not found', [], 'NOT_FOUND');

        self::deleteDir($path);
        echo json_encode(['success' => true]);
    }

    // ─── Rename folder ────────────────────────────────────────────────────────
    public static function renameFolder(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input   = self::getJsonInput();
        $old     = self::sanitizeFolderName($input['old_name'] ?? '');
        $new     = self::sanitizeFolderName($input['new_name'] ?? '');

        if (!$old || !$new) self::errorResponse(400, 'old_name and new_name required', [], 'MISSING');

        $oldPath = self::BASE_DIR . $old;
        $newPath = self::BASE_DIR . $new;

        if (!is_dir($oldPath))  self::errorResponse(404, 'Folder not found', [], 'NOT_FOUND');
        if (is_dir($newPath))   self::errorResponse(409, 'Name already exists', [], 'CONFLICT');
        if (!rename($oldPath, $newPath)) self::errorResponse(500, 'Rename failed', [], 'RENAME_FAILED');

        echo json_encode(['success' => true]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  STORAGE STATS
    // ══════════════════════════════════════════════════════════════════════════

    public static function getStorageStats(): void
    {
        self::authenticate();
        $base  = self::BASE_DIR;
        $used  = is_dir($base) ? self::dirSize($base) : 0;
        $total = disk_total_space($base ?: '/');
        $free  = disk_free_space($base ?: '/');

        // Count by type
        $byType = ['image' => 0, 'video' => 0, 'audio' => 0,
                   'pdf'   => 0, 'doc'   => 0, 'other' => 0];
        $imgExts   = ['jpg','jpeg','png','gif','webp','svg'];
        $videoExts = ['mp4','avi','mov','mkv','webm'];
        $audioExts = ['mp3','wav','ogg','flac','aac'];
        $docExts   = ['doc','docx','xls','xlsx','csv','txt'];

        if (is_dir($base)) {
            $iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base));
            foreach ($iter as $file) {
                if (!$file->isFile()) continue;
                $ext = strtolower($file->getExtension());
                if ($ext === 'pdf') $byType['pdf']++;
                elseif (in_array($ext, $imgExts))   $byType['image']++;
                elseif (in_array($ext, $videoExts)) $byType['video']++;
                elseif (in_array($ext, $audioExts)) $byType['audio']++;
                elseif (in_array($ext, $docExts))   $byType['doc']++;
                else $byType['other']++;
            }
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'used'   => $used,
                'total'  => $total,
                'free'   => $free,
                'byType' => $byType,
            ],
        ]);
    }

    // ══════════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private static function resolveDir(string $folder): string
    {
        return $folder ? self::BASE_DIR . $folder . '/' : self::BASE_DIR;
    }

    private static function ensureDir(string $dir): void
    {
        if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
            self::errorResponse(500, 'Cannot create directory', [], 'DIR_FAILED');
        }
    }

    private static function scanFiles(string $dir, string $folder): array
    {
        if (!is_dir($dir)) return [];
        $meta  = self::readMeta($dir);
        $files = [];

        foreach (scandir($dir) as $file) {
            if ($file[0] === '.') continue;
            $path = $dir . $file;
            if (!is_file($path)) continue;
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!in_array($ext, self::ALLOWED_EXT, true)) continue;

            $files[] = [
                'name'       => $file,
                'type'       => $ext,
                'size'       => filesize($path),
                'modified'   => date('Y-m-d H:i:s', filemtime($path)),
                'url'        => '/uploads/operation/forms/' . ($folder ? $folder . '/' : '') . rawurlencode($file),
                'folder'     => $folder,
                'starred'    => $meta[$file]['starred']    ?? false,
                'shared'     => $meta[$file]['shared']     ?? [],
                'uploadedBy' => $meta[$file]['uploadedBy'] ?? '',
            ];
        }

        usort($files, fn($a, $b) => strtotime($b['modified']) - strtotime($a['modified']));
        return $files;
    }

    private static function readMeta(string $dir): array
    {
        $path = rtrim($dir, '/') . '/.meta.json';
        if (!file_exists($path)) return [];
        $data = json_decode(file_get_contents($path), true);
        return is_array($data) ? $data : [];
    }

    private static function dirSize(string $path): int
    {
        $size = 0;
        try {
            $iter = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
            foreach ($iter as $file) {
                if ($file->isFile()) $size += $file->getSize();
            }
        } catch (\Exception $e) {}
        return $size;
    }

    private static function deleteDir(string $path): void
    {
        if (!is_dir($path)) return;
        foreach (scandir($path) as $f) {
            if ($f === '.' || $f === '..') continue;
            $sub = $path . '/' . $f;
            is_dir($sub) ? self::deleteDir($sub) : unlink($sub);
        }
        rmdir($path);
    }

    private static function processUpload(
        string $name, string $tmp, int $error,
        int $size, string $dir, string $folder
    ): array {
        $safe = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

        if ($error !== UPLOAD_ERR_OK)
            return ['name' => $safe, 'status' => 'error', 'message' => self::uploadErrorMsg($error)];
        if ($size > self::MAX_SIZE)
            return ['name' => $safe, 'status' => 'error', 'message' => 'File too large (max 20MB)'];

        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($ext, self::ALLOWED_EXT, true))
            return ['name' => $safe, 'status' => 'error', 'message' => 'File type not allowed'];

        $saved = self::sanitizeFilename($name);
        $path  = $dir . $saved;
        if (file_exists($path)) { $saved = time() . '_' . $saved; $path = $dir . $saved; }

        if (!move_uploaded_file($tmp, $path))
            return ['name' => $safe, 'status' => 'error', 'message' => 'Failed to save'];

        // Save uploader name in meta
        $user = self::$currentUser;
        $uploadedBy = $user['u_username'] ?? $user['username'] ?? 'unknown';
        $metaFile = $dir . '.meta.json';
        $meta = file_exists($metaFile) ? json_decode(file_get_contents($metaFile), true) : [];
        $meta[$saved]['uploadedBy'] = $uploadedBy;
        file_put_contents($metaFile, json_encode($meta));

        return [
            'name'       => $safe,
            'saved_as'   => $saved,
            'size'       => $size,
            'type'       => $ext,
            'status'     => 'success',
            'uploadedBy' => $uploadedBy,
            'url'        => '/uploads/operation/forms/' . ($folder ? $folder . '/' : '') . rawurlencode($saved),
        ];
    }

    private static function sanitizeFilename(string $name): string
    {
        $name = preg_replace('/[^a-zA-Z0-9._\-]/u', '_', $name);
        $name = preg_replace('/_+/', '_', $name);
        return trim($name, '_') ?: 'file_' . time();
    }

    private static function sanitizeFolderName(string $name): string
    {
        $name = preg_replace('/[^a-zA-Z0-9_\-]/u', '', $name);
        return trim($name);
    }

    private static function uploadErrorMsg(int $code): string
    {
        return match ($code) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'File too large',
            UPLOAD_ERR_PARTIAL   => 'File partially uploaded',
            UPLOAD_ERR_NO_FILE   => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'No temp directory',
            UPLOAD_ERR_CANT_WRITE => 'Cannot write to disk',
            default              => 'Unknown upload error',
        };
    }
}
