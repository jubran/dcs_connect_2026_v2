<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/BaseAuthController.php';

class TankController extends BaseAuthController
{
    private const TANK_STATUS_MAP      = [
        'SERVICE'     => 'service',
        'FILLING'     => 'filling',
        'FEEDING'     => 'feeding',
        'RETURN'      => 'return_back',
        'MAINTENANCE' => 'maintenance'
    ];
    private const ALLOWED_TANK_COLUMNS = ['service', 'filling', 'feeding', 'return_back', 'maintenance'];
    private static function validateInput(array $input, array $requiredFields): array
    {
        $errors = [];

        foreach ($requiredFields as $field => $type) {
            if (!isset($input[$field]) || trim($input[$field] ?? '') === '') {
                $errors[$field] = ucfirst($field) . ' is required';
                continue;
            }

            $value = trim($input[$field]);

            switch ($type) {
                case 'string':
                    if (strlen($value) > 255) {
                        $errors[$field] = ucfirst($field) . ' is too long (max 255 characters)';
                    }
                    break;

                case 'integer':
                    if (!filter_var($value, FILTER_VALIDATE_INT)) {
                        $errors[$field] = ucfirst($field) . ' must be an integer';
                    }
                    break;

                case 'date':
                    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
                        $errors[$field] = ucfirst($field) . ' must be in YYYY-MM-DD format';
                    }
                    break;

                case 'time':
                    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $value)) {
                        $errors[$field] = ucfirst($field) . ' must be in HH:MM or HH:MM:SS format';
                    }
                    break;
            }
        }

        return $errors;
    }

public static function getTankStatus(): void
{
    global $conn;

    try {
        $stmt = $conn->prepare("
            SELECT 
                tank_number as location,
                service,
                filling,
                feeding,
                return_back,
                maintenance
            FROM tanks
            WHERE tank_number LIKE 'TANK#%'
            ORDER BY CAST(SUBSTR(TRIM(tank_number), 6) AS INTEGER)
        ");

        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $result = [];

        foreach ($rows as $row) {
            $statuses = [];

            // تحقق لكل حالة مفتوحة فقط
            $statuses[] = (strtolower($row['service'] ?? 'close') === 'open') ? 'SERVICE' : '';
            $statuses[] = (strtolower($row['filling'] ?? 'close') === 'open') ? 'FILLING' : '';
            $statuses[] = (strtolower($row['feeding'] ?? 'close') === 'open') ? 'FEEDING' : '';
            $statuses[] = (strtolower($row['maintenance'] ?? 'close') === 'open') ? 'MAINTENANCE' : '';
            $statuses[] = (strtolower($row['return_back'] ?? 'close') === 'open') ? 'RETURN' : '';

            // إزالة القيم الفارغة
            $statuses = array_filter($statuses);

            // إذا لم يوجد أي صمام مفتوح
            if (empty($statuses)) {
                $statuses[] = 'SETTLING';
            }

            $result[] = [
                'location' => $row['location'],
                'status1'  => array_values($statuses) // إعادة ترقيم المصفوفة
            ];
        }

        header('Content-Type: application/json');
        echo json_encode($result);

    } catch (PDOException $e) {
        self::errorResponse(
            500,
            'Database error: ' . $e->getMessage(),
            [],
            'DB_ERROR'
        );
    }
}

    public static function insertToTanks()
    {
        global $conn;

        $conn->beginTransaction();
        $input          = json_decode(file_get_contents('php://input'), true);
        $requiredFields = [
            'eventDate'   => 'date',
            'eventTime'   => 'time',
            'location'    => 'string',
            'TankTag'     => 'string',
            'TypeStatus'  => 'string',
            'ValveStatus' => 'string'
        ];
        $errors         = self::validateInput($input, $requiredFields);

        try {
            $eventText = $input['OperationData'] ?? null;

            // INSERT INTO events
            $stmt = $conn->prepare("
                INSERT INTO events (username1, date1, time1, location, entityType, action)
                VALUES (:user, :date, :time, :location, :entityType, :action)
            ");
            $stmt->execute([
                ':user'     => $input['username'],
                ':date'     => $input['eventDate'],
                ':time'     => $input['eventTime'],
                ':location' => $input['location'],
                ':action'   => $eventText
            ]);

            $eventId = $conn->lastInsertId();

            // INSERT INTO tank_operations
            $op = [
                'tank_number'       => $input['location'],
                'target'            => $input['TankTag'],
                'type_status'       => $input['TypeStatus'],
                'valve_status'      => strtolower($input['ValveStatus']),
                'isDoubleOperation' => $input['isDoubleOperation'] ?? false,
                'type_status_2'     => $input['TypeStatus2'] ?? null,
                'target_2'          => $input['TankTag2'] ?? null,
                'valve_status_2'    => strtolower($input['ValveStatus2'] ?? '')
            ];

            $eventTime = $input['eventDate'] . ' ' . $input['eventTime'];

            $stmt = $conn->prepare("
    INSERT INTO tank_operations (
        event_id,
        tank_number,
        type_status,
        target,
        valve_status,
        is_double_operation,
        type_status_2,
        target_2,
        valve_status_2,
        event_time
    ) VALUES (
        :event_id,
        :tank,
        :type,
        :target,
        :valve,
        :is_double,
        :type2,
        :target2,
        :valve2,
        :event_time
    )
");

            $stmt->execute([
                ':event_id'   => $eventId,
                ':tank'       => $input['location'],
                ':type'       => strtoupper($input['TypeStatus']),
                ':target'     => $input['TankTag'],
                ':valve'      => strtolower($input['ValveStatus']), // open | close
                ':is_double'  => !empty($input['isDoubleOperation']) ? 1 : 0,
                ':type2'      => $input['TypeStatus2'] ?? null,
                ':target2'    => $input['TankTag2'] ?? null,
                ':valve2'     => strtolower($input['ValveStatus2'] ?? ''),
                ':event_time' => $eventTime
            ]);

            // تحديث حالة الخزان
            self::rebuildTankState($input['location']);

            $conn->commit();
            echo json_encode(['success' => true]);

        } catch (Throwable $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => $e->getMessage()
            ]);
        }
    }
    public static function updateTank()
    {
        global $conn;

        $conn->beginTransaction();
        $input = json_decode(file_get_contents('php://input'), true);
        $id    = isset($input['id']) ? intval($input['id']) : 0;

        try {
            $eventText = $input['OperationData'] ?? null;

            $op = [
                'type_status'       => $input['TypeStatus'] ?? null,
                'valve_status'      => strtolower($input['ValveStatus'] ?? ''),
                'target'            => $input['TankTag'] ?? null,
                'isDoubleOperation' => $input['isDoubleOperation'] ?? false,
                'type_status_2'     => $input['TypeStatus2'] ?? null,
                'valve_status_2'    => strtolower($input['ValveStatus2'] ?? ''),
                'target_2'          => $input['TankTag2'] ?? null
            ];

            // تحديث جدول events
            $stmt = $conn->prepare("
                UPDATE events
                SET date1 = :date,
                    time1 = :time,
                    updated_by = :user,
                    entityType = :entityType,
                    action = :action
                WHERE id = :id
            ");
            $stmt->execute([
                ':date'       => $input['eventDate'],
                ':time'       => $input['eventTime'],
                ':user'       => $input['username'],
                ':entityType' => 'tank',
                ':action'     => $eventText,
                ':id'         => $id
            ]);

            // تحديث عمليات الخزان
            $stmt = $conn->prepare("
                UPDATE tank_operations
                SET
                  type_status = :type,
                  target = :target,
                  valve_status = :valve,
                  is_double_operation = :is_double,
                  type_status_2 = :type2,
                  target_2 = :target2,
                  valve_status_2 = :valve2
                WHERE event_id = :event_id
            ");

            $stmt->execute([
                ':type'      => $op['type_status'],
                ':target'    => $op['target'],
                ':valve'     => $op['valve_status'],
                ':is_double' => $op['isDoubleOperation'] ? 1 : 0,
                ':type2'     => $op['type_status_2'],
                ':target2'   => $op['target_2'],
                ':valve2'    => $op['valve_status_2'],
                ':event_id'  => $id
            ]);

            // تحديث حالة الخزان
            self::syncTankStatus($input['location'], $op);

            $conn->commit();
            echo json_encode(['success' => true]);

        } catch (Throwable $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString()
            ]);
        }
    }
    public static function deleteTankEvents(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            self::errorResponse(405, 'Method not allowed', [], 'METHOD_NOT_ALLOWED');
        }

        self::authenticate();
        $user = self::getCurrentUser();

        $input = json_decode(file_get_contents("php://input"), true);
        if (!$input || json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(400, 'Invalid JSON: ' . json_last_error_msg(), [], 'INVALID_JSON');
        }

        $eventIds   = $input['event_ids'] ?? [];
        $softDelete = filter_var($input['soft_delete'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if (empty($eventIds) || !is_array($eventIds)) {
            self::errorResponse(422, 'Event IDs array is required', [], 'INVALID_EVENT_IDS');
        }

        // sanitize IDs
        $sanitizedIds = array_filter(array_map(fn($id) => intval($id) > 0 ? intval($id) : null, $eventIds));
        if (empty($sanitizedIds)) {
            self::errorResponse(422, 'No valid event IDs provided', [], 'NO_VALID_IDS');
        }

        global $conn;
        $conn->beginTransaction();

        try {
            $placeholders = implode(',', array_fill(0, count($sanitizedIds), '?'));

            // 1️⃣ جلب بيانات الأحداث قبل الحذف
            $stmt = $conn->prepare("SELECT * FROM events WHERE id IN ($placeholders)");
            $stmt->execute($sanitizedIds);
            $eventsData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($eventsData)) {
                $conn->rollBack();
                self::errorResponse(404, 'No events found', [], 'EVENTS_NOT_FOUND');
            }

            // 2️⃣ لكل حدث، حذف من tank_operations
            $stmtDelOps = $conn->prepare("DELETE FROM tank_operations WHERE event_id = ?");
            foreach ($eventsData as $event) {
                $stmtDelOps->execute([$event['id']]);
            }

            // 3️⃣ حذف من events
            $stmtDelEvents = $conn->prepare("DELETE FROM events WHERE id = ?");
            foreach ($eventsData as $event) {
                $stmtDelEvents->execute([$event['id']]);
            }

            // 4️⃣ إعادة بناء الحالة لكل خزان متأثر
            $affectedTanks = [];
            foreach ($eventsData as $event) {
                $tank = $event['location'];
                if (!in_array($tank, $affectedTanks)) {
                    self::rebuildTankState($tank);
                    $affectedTanks[] = $tank;
                }
            }

            $conn->commit();

            echo json_encode([
                'success'       => true,
                'message'       => 'Events deleted successfully',
                'deleted_ids'   => $sanitizedIds,
                'affectedTanks' => $affectedTanks,
                'deleted_by'    => $user['username']
            ]);

        } catch (Throwable $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            self::errorResponse(500, 'Database error: ' . $e->getMessage(), [], 'DB_ERROR');
        }
    }
    public static function rebuildTankState(string $tankNumber): void
    {
        global $conn;

        // 1️⃣ اجلب جميع العمليات للخزان حسب الزمن الحقيقي
        $stmt = $conn->prepare("
        SELECT *
        FROM tank_operations
        WHERE tank_number = :tank
        ORDER BY event_time ASC
    ");
        $stmt->execute([':tank' => $tankNumber]);
        $operations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2️⃣ الحالة الافتراضية لكل صمام
        $state = [
            'SERVICE'     => 'close',
            'FILLING'     => 'close',
            'FEEDING'     => 'close',
            'MAINTENANCE' => 'close',
        ];

        // 3️⃣ تطبيق العمليات بالتسلسل
        foreach ($operations as $op) {

            // النوع الرئيسي
            $type  = strtoupper($op['type_status']);
            $valve = strtolower(trim($op['valve_status'] ?? 'close')) === 'open' ? 'open' : 'close';
            if (isset($state[$type])) {
                $state[$type] = $valve;
            }

            // النوع الثانوي إذا كانت العملية مزدوجة
            if (!empty($op['is_double_operation'])) {
                $type2  = strtoupper($op['type_status_2'] ?? '');
                $valve2 = strtolower(trim($op['valve_status_2'] ?? 'close')) === 'open' ? 'open' : 'close';
                if ($type2 && isset($state[$type2])) {
                    $state[$type2] = $valve2;
                }
            }
        }

        // // 4️⃣ التحقق: هل يوجد أي صمام مفتوح؟
        // $hasOpen = false;
        // foreach ($state as $valve) {
        //     if ($valve === 'open') {
        //         $hasOpen = true;
        //         break;
        //     }
        // }

        // // 5️⃣ تحديد الحالة النهائية للخزان
        // if (!$hasOpen) {
        //     $finalState = 'SETTLING';
        // } else {
        //     // أولوية تحديد الحالة إذا هناك صمامات مفتوحة
        //     $priority   = ['MAINTENANCE', 'SERVICE', 'FILLING', 'FEEDING'];
        //     $finalState = 'SETTLING'; // Default fallback
        //     foreach ($priority as $mode) {
        //         if ($state[$mode] === 'open') {
        //             $finalState = $mode;
        //             break;
        //         }
        //     }
        // }

        // 6️⃣ تحديث جدول tanks
        $stmtUpdate = $conn->prepare("
        UPDATE tanks
        SET service = :service,
            filling = :filling,
            feeding = :feeding,
            maintenance = :maintenance
        WHERE tank_number = :tank
    ");
     $stmtUpdate->execute([
            ':service'       => $state['SERVICE'],
            ':filling'       => $state['FILLING'],
            ':feeding'       => $state['FEEDING'],
            ':maintenance'   => $state['MAINTENANCE'],
            ':tank'          => $tankNumber
        ]);
    //  $stmtUpdate = $conn->prepare("
    //     UPDATE tanks
    //     SET service = :service,
    //         filling = :filling,
    //         feeding = :feeding,
    //         maintenance = :maintenance,
    //         current_state = :current_state
    //     WHERE tank_number = :tank
    // ");
// $stmtUpdate->execute([
//             ':service'       => $state['SERVICE'],
//             ':filling'       => $state['FILLING'],
//             ':feeding'       => $state['FEEDING'],
//             ':maintenance'   => $state['MAINTENANCE'],
//             ':current_state' => $finalState,
//             ':tank'          => $tankNumber
//         ]);
       
    }

    private static function syncTankStatus(string $tank, array $op)
    {
        global $conn;

        $map = [
            'SERVICE'     => 'service',
            'FILLING'     => 'filling',
            'FEEDING'     => 'feeding',
            'RETURN'      => 'return_back',
            'MAINTENANCE' => 'maintenance'
        ];

        $operations = [
            [$op['type_status'], $op['valve_status']],
            [$op['type_status_2'] ?? null, $op['valve_status_2'] ?? null],
        ];

        foreach ($operations as [$type, $status]) {
            if (!$type || !isset($map[$type])) continue;

            $column = $map[$type];
            $value  = ($status === 'open') ? $type : '';

            $stmt = $conn->prepare("
                UPDATE tanks
                SET {$column} = :val
                WHERE tank_number = :tank
            ");
            $stmt->execute([
                ':val'  => $value,
                ':tank' => $tank
            ]);
        }
    }

    /* ====================
       FILE FUNCTIONS
       ==================== */

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
        $maxFileSize       = 10 * 1024 * 1024; // 10MB
        $response          = [];

        foreach ($_FILES['files']['name'] as $key => $name) {
            $tmpName = $_FILES['files']['tmp_name'][$key];
            $error   = $_FILES['files']['error'][$key];
            $size    = $_FILES['files']['size'][$key];

            // Check for upload errors
            if ($error !== UPLOAD_ERR_OK) {
                $response[] = [
                    'name'    => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status'  => 'error',
                    'message' => self::getUploadError($error)
                ];
                continue;
            }

            // Check file size
            if ($size > $maxFileSize) {
                $response[] = [
                    'name'    => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status'  => 'error',
                    'message' => 'File too large (max 10MB)'
                ];
                continue;
            }

            // Check file extension
            $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($extension, $allowedExtensions, true)) {
                $response[] = [
                    'name'    => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status'  => 'error',
                    'message' => 'File type not allowed'
                ];
                continue;
            }

            // Sanitize filename
            $safeFilename = self::sanitizeFilename($name);
            $targetFile   = $targetDir . $safeFilename;

            // Prevent overwriting
            if (file_exists($targetFile)) {
                $safeFilename = time() . '_' . $safeFilename;
                $targetFile   = $targetDir . $safeFilename;
            }

            // Move uploaded file
            if (move_uploaded_file($tmpName, $targetFile)) {
                $response[] = [
                    'name'     => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'saved_as' => $safeFilename,
                    'size'     => $size,
                    'status'   => 'success',
                    'url'      => '/uploads/operation/forms/' . $safeFilename
                ];
            } else {
                $response[] = [
                    'name'    => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
                    'status'  => 'error',
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

        $files             = [];
        $allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'];

        foreach (scandir($dir) as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $path      = $dir . $file;
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            if (!in_array($extension, $allowedExtensions, true)) {
                continue;
            }

            if (!is_file($path)) {
                continue;
            }

            $files[] = [
                "name"     => htmlspecialchars($file, ENT_QUOTES, 'UTF-8'),
                "type"     => $extension,
                "size"     => filesize($path),
                "modified" => date("Y-m-d H:i:s", filemtime($path)),
                "url"      => '/uploads/operation/forms/' . urlencode($file)
            ];
        }

        // Sort by modification date (newest first)
        usort($files, function ($a, $b) {
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