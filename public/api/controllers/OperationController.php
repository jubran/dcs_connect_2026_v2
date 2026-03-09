<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/BaseAuthController.php';

class OperationController extends BaseAuthController
{
    private const ALLOWED_ENTITY_TYPES = ['units', 'tank', 'transformer', 'nonestatus', 's'];

    /**
     * التحقق من صحة البيانات المدخلة
     */
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

    /* ====================
       OPERATIONS FUNCTIONS
       ==================== */

    /**
     * معالج العمليات الرئيسي
     */
    public static function operations(): void
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

        $input = json_decode(file_get_contents('php://input'), true);

        if (empty($input) || json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(
                400,
                'Invalid JSON payload: ' . json_last_error_msg(),
                [],
                'INVALID_JSON'
            );
        }

        $entityType = strtolower(trim($input['entityType'] ?? ''));

        if (!in_array($entityType, self::ALLOWED_ENTITY_TYPES, true)) {
            self::errorResponse(
                422,
                'Invalid entity type',
                [
                    'allowed'  => self::ALLOWED_ENTITY_TYPES,
                    'received' => $entityType
                ],
                'INVALID_ENTITY_TYPE'
            );
        }

        switch ($entityType) {
            case 'units':
                self::unitOperation($input);
                break;

            case 'tank':
                // الدوال المتعلقة بالخزانات تم نقلها إلى TankController
                require_once __DIR__ . '/TankController.php';
                TankController::insertToTanks($input);
                break;

            case 'transformer':
                // الدوال المتعلقة بالمحولات تم نقلها إلى TransformerController
                require_once __DIR__ . '/TransformerController.php';
                TransformerController::transformerOperation($input);
                break;

            case 'nonestatus':
                self::insertToEvents($input);
                break;
        }
    }

    /**
     * إدراج حدث عام
     */
    public static function insertToEvents(array $input): void
    {
        global $conn;

        $requiredFields = [
            'eventDate' => 'string',
            'eventTime' => 'string',
            'location'  => 'string',
            'eventText' => 'string',
        ];

        $errors = self::validateInput($input, $requiredFields);

        if (!empty($errors)) {
            self::errorResponse(
                422,
                'Validation failed',
                $errors,
                'VALIDATION_ERROR'
            );
        }

        try {
            // الحصول على المستخدم الحالي من التوكن
            $user = self::getCurrentUser();

            $stmt = $conn->prepare(
                'INSERT INTO events (
                    username1,
                    date1,
                    time1,
                    location,
                    entityType,
                    action
                ) VALUES (
                    :user,
                    :date,
                    :time,
                    :location,
                    :entityType,
                    :action
                )'
            );

            $stmt->execute([
                ':user'       => htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8'),
                ':date'       => $input['eventDate'],
                ':time'       => $input['eventTime'],
                ':location'   => htmlspecialchars($input['location'], ENT_QUOTES, 'UTF-8'),
                ':entityType' => 'nonestatus',
                ':action'     => htmlspecialchars($input['eventText'], ENT_QUOTES, 'UTF-8'),
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Event recorded successfully',
                'id'      => $conn->lastInsertId(),
                'user'    => $user['username']
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

    /**
     * تسجيل عملية وحدة (Unit)
     */
    public static function unitOperation(array $input): void
    {
        global $conn;

        $requiredFields = [
            'location'         => 'string',
            'eventDate'        => 'date',
            'eventTime'        => 'time',
            'selectStatusMenu' => 'string'
        ];

        $errors = self::validateInput($input, $requiredFields);

        if (!empty($errors)) {
            self::errorResponse(
                422,
                'Missing required fields',
                $errors,
                'VALIDATION_ERROR'
            );
        }

        try {
            // الحصول على المستخدم الحالي من التوكن
            $user = self::getCurrentUser();

            $stmt = $conn->prepare("
                INSERT INTO events (
                    username1,
                    date1,
                    time1,
                    location,
                    entityType,
                    status1,
                    shutdownType,
                    shutdownReason,
                    foReason,
                    sapOrder,
                    action,
                    note,
                    hyd,
                    flame,
                    fsnl,
                    synch,
                    gsu,
                    ir
                ) VALUES (
                    :username1,
                    :date1,
                    :time1,
                    :location,
                    :entityType,
                    :status1,
                    :shutdownType,
                    :shutdownReason,
                    :foReason,
                    :sapOrder,
                    :action,
                    :note,
                    :hyd,
                    :flame,
                    :fsnl,
                    :synch,
                    :gsu,
                    :ir
                )
            ");

            $stmt->execute([
                ':username1'      => htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8'),
                ':date1'          => $input['eventDate'],
                ':time1'          => $input['eventTime'],
                ':location'       => htmlspecialchars($input['location'], ENT_QUOTES, 'UTF-8'),
                ':entityType'     => 'units',
                ':status1'        => htmlspecialchars($input['selectStatusMenu'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':shutdownType'   => htmlspecialchars($input['shutdownType'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':shutdownReason' => htmlspecialchars($input['shutdownReason'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':foReason'       => htmlspecialchars($input['foReason'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':sapOrder'       => htmlspecialchars($input['sapOrder'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':action'         => htmlspecialchars($input['eventText'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':note'           => htmlspecialchars($input['note'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':hyd'            => htmlspecialchars($input['selectedRatching'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':flame'          => htmlspecialchars($input['flameRPM'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':fsnl'           => htmlspecialchars($input['fsnlTime'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':synch'          => htmlspecialchars($input['synchTime'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':gsu'            => htmlspecialchars($input['transformerAction'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':ir'             => htmlspecialchars($input['IER'] ?? '', ENT_QUOTES, 'UTF-8'),
            ]);

            echo json_encode([
                'success' => true,
                'message' => 'Unit operation recorded successfully',
                'id'      => $conn->lastInsertId(),
                'user'    => $user['username']
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

    /* ====================
       UPDATE OPERATIONS
       ==================== */

    /**
     * معالج التحديثات الرئيسي
     */
    public static function updateOperation(): void
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

        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input || json_last_error() !== JSON_ERROR_NONE) {
            self::errorResponse(
                400,
                'Invalid JSON: ' . json_last_error_msg(),
                [],
                'INVALID_JSON'
            );
        }

        $entityType = strtolower(trim($input['entityType'] ?? ''));
        $id         = intval($input['id'] ?? 0);

        if (!$id || $id <= 0) {
            self::errorResponse(
                422,
                'Invalid or missing ID',
                [],
                'INVALID_ID'
            );
        }

        if (!in_array($entityType, ['units', 'tank', 'transformer'], true)) {
            self::errorResponse(
                422,
                'Invalid entity type for update',
                ['allowed' => ['units', 'tank', 'transformer']],
                'INVALID_ENTITY_TYPE'
            );
        }

        switch ($entityType) {
            case 'units':
                self::updateUnit($id, $input);
                break;

            case 'tank':
                // الدوال المتعلقة بالخزانات تم نقلها إلى TankController
                require_once __DIR__ . '/TankController.php';
                TankController::updateTank($id, $input);
                break;

            case 'transformer':
                require_once __DIR__ . '/TransformerController.php';
                TransformerController::updateTransformer($id, $input);
                break;
        }
    }

    /**
     * تحديث عملية وحدة (Unit)
     */
    public static function updateUnit(int $id, array $input): void
    {
        global $conn;

        $requiredFields = [
            'location'         => 'string',
            'eventDate'        => 'date',
            'eventTime'        => 'time',
            'selectStatusMenu' => 'string'
        ];

        $errors = self::validateInput($input, $requiredFields);

        if (!empty($errors)) {
            self::errorResponse(
                422,
                'Missing required fields',
                $errors,
                'VALIDATION_ERROR'
            );
        }

        try {
            // الحصول على المستخدم الحالي من التوكن
            $user = self::getCurrentUser();

            // Verify event exists and user has permission
            $stmt = $conn->prepare("
                SELECT id FROM events 
                WHERE id = :id AND entityType = 'units' 
            ");
            $stmt->execute([':id' => $id]);

            if (!$stmt->fetch()) {
                throw new Exception('Event not found or no permission to update');
            }

            $stmt = $conn->prepare("
    UPDATE events
    SET
        username1 = :username1,
        date1 = :date1,
        time1 = :time1,
        location = :location,
        status1 = :status1,
        shutdownType = :shutdownType,
        shutdownReason = :shutdownReason,
        foReason = :foReason,
        sapOrder = :sapOrder,
        action = :action,
        note = :note,
        hyd = :hyd,
        flame = :flame,
        fsnl = :fsnl,
        synch = :synch,
        gsu = :gsu,
        ir = :ir,
        updated_by = 
            CASE 
                WHEN updated_by IS NOT NULL AND updated_by != '' THEN updated_by || CHAR(10) || :new_updated_by
                ELSE :new_updated_by
            END
    WHERE id = :id
");

            $now          = date('Y-m-d H:i'); // الوقت الحالي
            $newUpdatedBy = htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8') . ' ' . $now;

            $stmt->execute([
                ':id'             => $id,
                ':username1'      => htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8'),
                ':date1'          => $input['eventDate'],
                ':time1'          => $input['eventTime'],
                ':location'       => htmlspecialchars($input['location'], ENT_QUOTES, 'UTF-8'),
                ':status1'        => htmlspecialchars($input['selectStatusMenu'], ENT_QUOTES, 'UTF-8'),
                ':shutdownType'   => htmlspecialchars($input['shutdownType'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':shutdownReason' => htmlspecialchars($input['shutdownReason'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':foReason'       => htmlspecialchars($input['foReason'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':sapOrder'       => htmlspecialchars($input['sapOrder'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':action'         => htmlspecialchars($input['eventText'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':note'           => htmlspecialchars($input['note'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':hyd'            => htmlspecialchars($input['selectedRatching'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':flame'          => htmlspecialchars($input['flameRPM'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':fsnl'           => htmlspecialchars($input['fsnlTime'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':synch'          => htmlspecialchars($input['synchTime'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':gsu'            => htmlspecialchars($input['transformerAction'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':ir'             => htmlspecialchars($input['IER'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':new_updated_by' => $newUpdatedBy
            ]);


            echo json_encode([
                'success'    => true,
                'message'    => 'Unit operation updated successfully',
                'updated_by' => $user['username']
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
