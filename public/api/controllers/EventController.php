<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

require_once __DIR__ . '/BaseAuthController.php';
class EventController extends BaseAuthController
{

    public static function searchApi()
    {
        global $conn;

        $startDate = $_GET['startDate'] ?? null;
        $endDate   = $_GET['endDate'] ?? null;
        $location  = isset($_GET['location']) ? trim($_GET['location']) : '';

        $params       = [];
        $whereClauses = [];

        // 1. معالجة البحث بنطاق التاريخ (من تاريخ إلى تاريخ)
        if ($startDate && $endDate) {
            $whereClauses[]      = 'date1 BETWEEN :startDate AND :endDate';
            $params['startDate'] = $startDate;
            $params['endDate']   = $endDate;
        }
        // 2. معالجة البحث بتاريخ واحد (إذا تم تمرير startDate فقط - يغطي وظيفة dateQuery السابقة)
        else if ($startDate) {
            $whereClauses[]      = 'date1 = :startDate';
            $params['startDate'] = $startDate;
        }

        // 3. معالجة البحث بالموقع
        if (!empty($location)) {
            // إضافة شرط الموقع بغض النظر عن وجود التاريخ
            $whereClauses[]     = 'location LIKE :location';
            $params['location'] = '%' . $location . '%';
        }

        // بناء استعلام SQL
        $sql = 'SELECT * FROM events';
        if (!empty($whereClauses)) {
            $sql .= ' WHERE ' . implode(' AND ', $whereClauses);
        }
        $sql .= ' ORDER BY date1 ASC, time1 ASC';

        // 🚨 التصحيح / الدمج: إذا لم يتم تمرير أي معايير بحث، نرجع بيانات اليوم الحالي (السلوك الافتراضي السابق لـ dateQuery)
        if (empty($whereClauses)) {
            // جلب بيانات اليوم الحالي كقيمة افتراضية (يغطي متطلبات EventsViewPage الافتراضية)
            $today  = date('Y-m-d');
            $sql    = 'SELECT * FROM events WHERE date1 = :today ORDER BY time1 ASC';
            $params = ['today' => $today];
        }

        $rows = fetchData($conn, $sql, $params);
        echo json_encode($rows);
    }


    public static function dateQuery()
    {
        global $conn;
        $date = trim($_GET['dateQuery']);
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            respondError(400, 'Invalid date format; expected YYYY-MM-DD');
        }
        $rows = fetchData(
            $conn,
            'SELECT * FROM events WHERE date1 = :date',
            ['date' => $date]
        );
        echo json_encode($rows);
    }
    public static function requireRole(string $requiredRole): void
    {
        $user = self::getCurrentUser();

        if (($user['u_role'] ?? 'user') !== $requiredRole) {
            self::errorResponse(
                403,
                'Insufficient permissions',
                ['required_role' => $requiredRole, 'current_role' => $user['u_role'] ?? 'user'],
                'INSUFFICIENT_PERMISSIONS'
            );
        }
    }

    public static function deleteTodayEvents(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            self::errorResponse(
                405,
                'Method not allowed',
                [],
                'METHOD_NOT_ALLOWED'
            );
        }

        // تحقق من التوكن والمستوى
        self::authenticate();
        self::requireRole('admin');

        // Check if user has admin role
        $user = self::getCurrentUser();
        if (($user['u_role'] ?? 'user') !== 'admin') {
            self::errorResponse(
                403,
                'Admin privileges required',
                [],
                'FORBIDDEN'
            );
        }

        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input || json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(
                400,
                'Invalid JSON: ' . json_last_error_msg(),
                [],
                'INVALID_JSON'
            );
        }

        $date1 = filter_var($input['date1'] ?? '', FILTER_SANITIZE_STRING);

        if (!$date1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date1)) {
            self::errorResponse(
                422,
                'Invalid date format. Expected YYYY-MM-DD',
                [],
                'INVALID_DATE'
            );
        }

        try {
            global $conn;

            $stmt = $conn->prepare("
                UPDATE events 
                SET deleted = 1, 
                    deleted_at = datetime('now'),
                    deleted_by = :deleted_by
                WHERE date1 = :date1 
            ");

            $stmt->execute([
                ':date1'      => $date1,
                ':deleted_by' => $user['username']
            ]);

            $affectedRows = $stmt->rowCount();

            echo json_encode([
                'success'       => true,
                'message'       => "Soft deleted $affectedRows events for date $date1",
                'affected_rows' => $affectedRows,
                'deleted_by'    => $user['username']
            ]);
        } catch (PDOException $e) {
            self::errorResponse(
                500,
                'Database error: ' . $e->getMessage(),
                [],
                'DB_ERROR'
            );
        }
    }

    public static function deleteEvents(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            self::errorResponse(405, 'Method not allowed', [], 'METHOD_NOT_ALLOWED');
        }

        self::authenticate();
        $user = self::getCurrentUser();
        $role = $user['u_role'] ?? 'user';

        if ($role !== 'admin') {
            self::errorResponse(403, 'Admin privileges required', [], 'FORBIDDEN');
        }

        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input || json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(400, 'Invalid JSON: ' . json_last_error_msg(), [], 'INVALID_JSON');
        }

        // الحصول على نوع الكيان
        $entityType = strtolower($input['entity_type'] ?? 'events');

        // التوجيه حسب نوع الكيان
        switch ($entityType) {
            case 'tanks':
            case 'tank':
            case 'events':
                 require_once __DIR__ . '/TankController.php';
                TankController::deleteTankEvents($input);
                break;

            case 'units':
            case 'unit':
                self::deleteUnitEvents($input);
                break;

            case 'transformers':
            case 'transformer':
                self::deleteTransformerEvents($input);
                break;

            case 'events1':
            default:
                self::deleteGeneralEvents($input);
                break;
        }
    }
private static function deleteTankEventsOld(array $input): void
{
    global $conn;
    
    $eventIds = $input['event_ids'] ?? [];
    $softDelete = filter_var($input['soft_delete'] ?? true, FILTER_VALIDATE_BOOLEAN);
    
    if (empty($eventIds) || !is_array($eventIds)) {
        self::errorResponse(422, 'Event IDs array is required', [], 'INVALID_EVENT_IDS');
    }
    
    // Sanitize IDs
    $sanitizedIds = array_filter(array_map(fn($id) => intval($id) > 0 ? intval($id) : null, $eventIds));
    
    try {
        $conn->beginTransaction();
        
        $placeholders = implode(',', array_fill(0, count($sanitizedIds), '?'));
        
        // 1. جلب بيانات أحداث الخزانات قبل الحذف
        $stmt = $conn->prepare("
            SELECT e.*, t.tank_number 
            FROM tank_operations e
            LEFT JOIN tank_operations t ON e.id = t.event_id
            WHERE e.id IN ($placeholders) 
            AND e.entityType = 'tank'
        ");
        $stmt->execute($sanitizedIds);
        $eventsData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($eventsData)) {
            $conn->rollBack();
            self::errorResponse(404, 'No tank events found', [], 'TANK_EVENTS_NOT_FOUND');
        }
        
        // 2. تسجيل في audit log
        $logStmt = $conn->prepare("
            INSERT INTO tank_audit_log (event_id, tank_number, deleted_by, delete_type, old_data)
            VALUES (:event_id, :tank_number, :deleted_by, :delete_type, :old_data)
        ");
        
        foreach ($eventsData as $event) {
            $logStmt->execute([
                ':event_id' => $event['id'],
                ':tank_number' => $event['tank_number'] ?? null,
                ':deleted_by' => $input['username'] ?? 'system',
                ':delete_type' => $softDelete ? 'soft' : 'hard',
                ':old_data' => json_encode($event)
            ]);
        }
        
        // 3. الحذف من جدول العمليات الخاصة بالخزانات أولاً
        $stmt = $conn->prepare("DELETE FROM tank_operations WHERE event_id IN ($placeholders)");
        $stmt->execute($sanitizedIds);
        
        // 4. ثم الحذف من الأحداث
        if ($softDelete) {
            $stmt = $conn->prepare("
                UPDATE events 
                SET deleted = 1, deleted_at = datetime('now'), deleted_by = ?
                WHERE id IN ($placeholders) AND entityType = 'tank'
            ");
            $params = array_merge([$input['username'] ?? 'system'], $sanitizedIds);
        } else {
            $stmt = $conn->prepare("DELETE FROM events WHERE id IN ($placeholders) AND entityType = 'tank'");
            $params = $sanitizedIds;
        }
        
        $stmt->execute($params);
        $affectedRows = $stmt->rowCount();
        
        $conn->commit();
        
        echo json_encode([
            'success' => true,
            'message' => "Deleted $affectedRows tank events",
            'entity_type' => 'tanks',
            'soft_delete' => $softDelete
        ]);
        
    } catch (PDOException $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        self::errorResponse(500, 'Database error: ' . $e->getMessage(), [], 'DB_ERROR');
    }
}
private static function deleteUnitEvents(array $input): void
{
    global $conn;
    
    $eventIds = $input['event_ids'] ?? [];
    
    try {
        $conn->beginTransaction();
                $sanitizedIds = array_filter(array_map(fn($id) => intval($id) > 0 ? intval($id) : null, $eventIds));

        // يجب التأكد أن الأحداث هي لوحدات فقط
        $placeholders = implode(',', array_fill(0, count($sanitizedIds), '?'));
        
        $stmt = $conn->prepare("
            SELECT * FROM events 
            WHERE id IN ($placeholders) 
            AND entityType IN ('units', 'unit')
        ");
        $stmt->execute($sanitizedIds);
        $unitEvents = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        
        $conn->commit();
        
    } catch (PDOException $e) {
        if ($conn->inTransaction()) $conn->rollBack();
        self::errorResponse(500, 'Database error: ' . $e->getMessage(), [], 'DB_ERROR');
    }
}

    public static function deleteGeneralEvents($input): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            self::errorResponse(
                405,
                'Method not allowed',
                [],
                'METHOD_NOT_ALLOWED'
            );
        }

        self::authenticate();
        $user = self::getCurrentUser();
        $role = $user['u_role'] ?? 'user';

        if ($role !== 'admin') {
            self::errorResponse(
                403,
                'Admin privileges required',
                [],
                'FORBIDDEN'
            );
        }

        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input || json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(
                400,
                'Invalid JSON: ' . json_last_error_msg(),
                [],
                'INVALID_JSON'
            );
        }

        $eventIds   = $input['event_ids'] ?? [];
        $softDelete = filter_var($input['soft_delete'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (empty($eventIds) || !is_array($eventIds)) {
            self::errorResponse(
                422,
                'Event IDs array is required',
                [],
                'INVALID_EVENT_IDS'
            );
        }

        // Sanitize IDs
        $sanitizedIds = array_filter(array_map(fn($id) => intval($id) > 0 ? intval($id) : null, $eventIds));
        if (empty($sanitizedIds)) {
            self::errorResponse(
                422,
                'No valid event IDs provided',
                [],
                'NO_VALID_IDS'
            );
        }

        try {
            global $conn;
            $conn->beginTransaction(); // 🟢 بدء المعاملة

            $placeholders = implode(',', array_fill(0, count($sanitizedIds), '?'));

            // 1️⃣ جلب بيانات الأحداث قبل الحذف
            $stmt = $conn->prepare("SELECT * FROM events WHERE id IN ($placeholders)");
            $stmt->execute($sanitizedIds);
            $eventsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($eventsData)) {
                $conn->rollBack();
                self::errorResponse(
                    404,
                    'No events found or already deleted',
                    [],
                    'EVENTS_NOT_FOUND'
                );
            }

            // 2️⃣ تسجيل كل حدث في جدول audit log
            $logStmt = $conn->prepare("
            INSERT INTO events_audit_log (event_id, deleted_by, delete_type, old_data)
            VALUES (:event_id, :deleted_by, :delete_type, :old_data)
        ");

            foreach ($eventsData as $event) {
                $logStmt->execute([
                    ':event_id'    => $event['id'],
                    ':deleted_by'  => $user['username'],
                    ':delete_type' => $softDelete ? 'soft' : 'hard',
                    ':old_data'    => json_encode($event)
                ]);
            }

            if ($role !== 'admin') {
                $conn->rollBack();
                self::errorResponse(
                    403,
                    'admin privileges required for hard delete',
                    [],
                    'FORBIDDEN_HARD_DELETE'
                );
            }
            $stmt = $conn->prepare("DELETE FROM events WHERE id IN ($placeholders)");
            $stmt->execute($sanitizedIds);


            $affectedRows = $stmt->rowCount();
            $conn->commit(); // ✅ تأكيد المعاملة

            $message = $softDelete
                ? "Soft deleted $affectedRows events successfully"
                : "Permanently deleted $affectedRows events successfully";

            echo json_encode([
                'success'       => true,
                'message'       => $message,
                'affected_rows' => $affectedRows,
                'deleted_ids'   => $sanitizedIds,
                'soft_delete'   => $softDelete,
                'deleted_by'    => $user['username'],
                'entity_type'  => 'events',
            ]);

        } catch (PDOException $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            self::errorResponse(
                500,
                'Database error: ' . $e->getMessage(),
                [],
                'DB_ERROR'
            );
        }
    }

    public static function deleteTransformerEvents(array $input): void
    {
        // منطق الحذف الخاص بالمحولات
        // مشابه لمنطق الحذف العام مع تخصيصات خاصة بالمحولات
    }
    public static function deleteEventsOld(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            self::errorResponse(
                405,
                'Method not allowed',
                [],
                'METHOD_NOT_ALLOWED'
            );
        }

        // تحقق من التوكن والمستوى
        self::authenticate();

        $user = self::getCurrentUser();
        $role = $user['u_role'] ?? 'user';

        // Check if user has admin role
        if ($role !== 'admin') {
            self::errorResponse(
                403,
                'Admin privileges required',
                [],
                'FORBIDDEN'
            );
        }

        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input || json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(
                400,
                'Invalid JSON: ' . json_last_error_msg(),
                [],
                'INVALID_JSON'
            );
        }

        $eventIds   = $input['event_ids'] ?? [];
        $softDelete = filter_var($input['soft_delete'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (empty($eventIds) || !is_array($eventIds)) {
            self::errorResponse(
                422,
                'Event IDs array is required',
                [],
                'INVALID_EVENT_IDS'
            );
        }

        // Sanitize and validate IDs
        $sanitizedIds = array_filter(array_map(function ($id) {
            $id = intval($id);
            return $id > 0 ? $id : null;
        }, $eventIds));

        if (empty($sanitizedIds)) {
            self::errorResponse(
                422,
                'No valid event IDs provided',
                [],
                'NO_VALID_IDS'
            );
        }

        try {
            global $conn;
            $placeholders = implode(',', array_fill(0, count($sanitizedIds), '?'));

            if ($softDelete) {
                $stmt = $conn->prepare("
                    UPDATE events 
                    SET deleted = 1, 
                        deleted_at = datetime('now'),
                        deleted_by = ?
                    WHERE id IN ($placeholders) 
                ");

                $params = array_merge([$user['username']], $sanitizedIds);
                $stmt->execute($params);
            } else {
                // Hard delete - only for admins with special permission
                if ($role !== 'super_admin') {
                    self::errorResponse(
                        403,
                        'Super admin privileges required for hard delete',
                        [],
                        'FORBIDDEN_HARD_DELETE'
                    );
                }

                $stmt = $conn->prepare("DELETE FROM events WHERE id IN ($placeholders)");
                $stmt->execute($sanitizedIds);
            }

            $affectedRows = $stmt->rowCount();

            if ($affectedRows === 0) {
                self::errorResponse(
                    404,
                    'No events found or already deleted',
                    [],
                    'EVENTS_NOT_FOUND'
                );
            }

            $message = $softDelete
                ? "Soft deleted $affectedRows events successfully"
                : "Permanently deleted $affectedRows events successfully";

            echo json_encode([
                'success'       => true,
                'message'       => $message,
                'affected_rows' => $affectedRows,
                'deleted_ids'   => $sanitizedIds,
                'soft_delete'   => $softDelete,
                'deleted_by'    => $user['username']
            ]);

        } catch (PDOException $e) {
            self::errorResponse(
                500,
                'Database error: ' . $e->getMessage(),
                [],
                'DB_ERROR'
            );
        }
    }
}