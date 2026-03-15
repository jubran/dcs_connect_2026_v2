<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/BaseAuthController.php';
require_once __DIR__ . '/../migrations.php';

class NotificationController extends BaseAuthController
{
    /** Ensure table exists on every call — idempotent */
    private static function boot(): void
    {
        global $conn;
        ensureNotificationsTable($conn);
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────
    public static function createNotification(array $input = []): void
    {
        global $conn;
        self::boot();
        self::authenticate();

        if (empty($input)) $input = self::getJsonInput();

        // Required fields
        $title       = trim($input['title']          ?? '');
        $description = trim($input['description']    ?? '');
        $type        = trim($input['type']           ?? 'system');
        $priority    = trim($input['priority']       ?? 'medium');
        $audience    = trim($input['targetAudience'] ?? 'all');

        if (!$title || !$description) {
            self::errorResponse(422, 'العنوان والوصف مطلوبان', [], 'VALIDATION_ERROR');
        }

        $user      = self::getCurrentUser();
        $createdBy = $user['u_username'] ?? 'system';
        $createdAt = date('Y-m-d H:i:s');

        $sql = "INSERT INTO notifications
                    (title, description, type, priority, target_audience,
                     is_unread, is_new, created_by, created_at)
                VALUES
                    (:title, :description, :type, :priority, :audience,
                     1, 1, :created_by, :created_at)";

        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':title'       => $title,
            ':description' => $description,
            ':type'        => $type,
            ':priority'    => $priority,
            ':audience'    => $audience,
            ':created_by'  => $createdBy,
            ':created_at'  => $createdAt,
        ]);

        $newId = $conn->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'تم إنشاء الإشعار بنجاح',
            'data'    => [
                'id'             => (int)$newId,
                'title'          => $title,
                'description'    => $description,
                'type'           => $type,
                'priority'       => $priority,
                'targetAudience' => $audience,
                'isUnRead'       => true,
                'isNew'          => true,
                'createdBy'      => $createdBy,
                'createdAt'      => $createdAt,
            ],
        ]);
    }

    // ─── GET ALL ──────────────────────────────────────────────────────────────
    public static function getNotifications(): void
    {
        global $conn;
        self::boot();
        self::authenticate();

        $user     = self::getCurrentUser();
        $role     = $user['u_role'] ?? 'user';

        // Managers see all, users see only their audience
        if ($role === 'manager' || $role === 'admin') {
            $sql    = "SELECT * FROM notifications ORDER BY created_at DESC";
            $params = [];
        } else {
            $sql    = "SELECT * FROM notifications
                       WHERE target_audience IN ('all', :role)
                       ORDER BY created_at DESC";
            $params = [':role' => $role];
        }

        $rows = fetchData($conn, $sql, $params);

        // Map snake_case → camelCase for the frontend
        $mapped = array_map(function ($row) {
            return [
                'id'             => (int)$row['id'],
                'title'          => $row['title'],
                'description'    => $row['description'],
                'type'           => $row['type'],
                'priority'       => $row['priority'],
                'targetAudience' => $row['target_audience'],
                'isUnRead'       => (bool)$row['is_unread'],
                'isNew'          => (bool)$row['is_new'],
                'createdBy'      => $row['created_by'],
                'createdAt'      => $row['created_at'],
                'avatarUrl'      => null,
                'category'       => $row['type'],
            ];
        }, $rows);

        echo json_encode($mapped);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    public static function updateNotification(array $input = []): void
    {
        global $conn;
        self::boot();
        self::authenticate();

        if (empty($input)) $input = self::getJsonInput();

        // Accept id from: JSON body → query string → fallback 0
        $id          = (int)($input['id'] ?? $_GET['id'] ?? 0);
        $title       = trim($input['title']          ?? '');
        $description = trim($input['description']    ?? '');
        $type        = trim($input['type']           ?? 'system');
        $priority    = trim($input['priority']       ?? 'medium');
        $audience    = trim($input['targetAudience'] ?? 'all');

        if (!$id) {
            self::errorResponse(422, 'معرف الإشعار مطلوب — أرسل id في الـ JSON body أو ?id=X في الـ URL', [], 'VALIDATION_ERROR');
        }

        $sql = "UPDATE notifications SET
                    title          = :title,
                    description    = :description,
                    type           = :type,
                    priority       = :priority,
                    target_audience = :audience,
                    updated_at     = :updated_at
                WHERE id = :id";

        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':title'       => $title,
            ':description' => $description,
            ':type'        => $type,
            ':priority'    => $priority,
            ':audience'    => $audience,
            ':updated_at'  => date('Y-m-d H:i:s'),
            ':id'          => $id,
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'تم تحديث الإشعار بنجاح',
        ]);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    public static function deleteNotification(array $input = []): void
    {
        global $conn;
        self::boot();
        self::authenticate();

        if (empty($input)) $input = self::getJsonInput();

        // Accept id from: JSON body → query string → fallback 0
        $id = (int)($input['id'] ?? $_GET['id'] ?? 0);

        if (!$id) {
            self::errorResponse(422, 'معرف الإشعار مطلوب — أرسل id في الـ JSON body أو ?id=X في الـ URL', [], 'VALIDATION_ERROR');
        }

        $stmt = $conn->prepare("DELETE FROM notifications WHERE id = :id");
        $stmt->execute([':id' => $id]);

        echo json_encode([
            'success' => true,
            'message' => 'تم حذف الإشعار بنجاح',
        ]);
    }

    // ─── MARK SINGLE AS READ ─────────────────────────────────────────────────
    public static function markNotificationRead(array $input = []): void
    {
        global $conn;
        self::boot();
        self::authenticate();

        if (empty($input)) $input = self::getJsonInput();

        $id = (int)($input['id'] ?? 0);

        if (!$id) {
            self::errorResponse(422, 'معرف الإشعار مطلوب', [], 'VALIDATION_ERROR');
        }

        $stmt = $conn->prepare(
            "UPDATE notifications SET is_unread = 0, is_new = 0 WHERE id = :id"
        );
        $stmt->execute([':id' => $id]);

        echo json_encode([
            'success' => true,
            'message' => 'تم تحديد الإشعار كمقروء',
        ]);
    }

    // ─── MARK ALL AS READ ────────────────────────────────────────────────────
    public static function markAllNotificationsRead(): void
    {
        global $conn;
        self::boot();
        self::authenticate();

        $conn->exec("UPDATE notifications SET is_unread = 0, is_new = 0");

        echo json_encode([
            'success' => true,
            'message' => 'تم تحديد جميع الإشعارات كمقروءة',
        ]);
    }

    // ─── STATS ───────────────────────────────────────────────────────────────
    public static function getNotificationStats(): void
    {
        global $conn;
        self::boot();
        self::authenticate();

        $today = date('Y-m-d');

        $stats = [
            'total'    => (int)$conn->query("SELECT COUNT(*) FROM notifications")->fetchColumn(),
            'unread'   => (int)$conn->query("SELECT COUNT(*) FROM notifications WHERE is_unread = 1")->fetchColumn(),
            'critical' => (int)$conn->query("SELECT COUNT(*) FROM notifications WHERE priority = 'critical'")->fetchColumn(),
            'today'    => (int)$conn->query("SELECT COUNT(*) FROM notifications WHERE DATE(created_at) = '$today'")->fetchColumn(),
        ];

        echo json_encode(['success' => true, 'data' => $stats]);
    }
}
