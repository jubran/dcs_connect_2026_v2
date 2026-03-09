<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/BaseAuthController.php';

class TransformerController extends BaseAuthController
{

    /**
     * التحقق من صلاحية الدور
     */
    public static function requireRole(string $requiredRole): void
    {
        $user = self::getCurrentUser();
        
        if (($user['u_role'] ?? 'user') !== $requiredRole) {
            self::errorResponse(
                403,
                'Role not allowed for this operation',
                ['required_role' => $requiredRole],
                'FORBIDDEN'
            );
        }
    }

    /**
     * التحقق من صحة البيانات المدخلة
     */
    private static function validateInput(array $input, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $type) {
            if (!isset($input[$field]) || trim($input[$field] ?? '') === '') {
                $errors[$field] = "Field is required";
                continue;
            }

            $value = $input[$field];

            switch ($type) {
                case 'string':
                    if (!is_string($value) || strlen(trim($value)) === 0) {
                        $errors[$field] = "Must be a valid string";
                    }
                    break;
                case 'date':
                    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
                        $errors[$field] = "Must be in format YYYY-MM-DD";
                    }
                    break;
                case 'time':
                    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $value)) {
                        $errors[$field] = "Must be in format HH:MM or HH:MM:SS";
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
     * تسجيل عملية محول (Transformer)
     */
    public static function createTransOperation(array $input): void
    {
        global $conn;

        $requiredFields = [
            'location' => 'string',
            'eventDate' => 'date',
            'eventTime' => 'time'
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
            // $user = self::getCurrentUser();
            
            $conn->beginTransaction();

      $text = "Main Power Transformer ";
$transformerAction = trim($input['transformerAction'] ?? '');
$eventText = trim($input['eventText'] ?? '');

$action = $text . $transformerAction;
if ($eventText !== '') {
    $action .= ' AND ' . $eventText;
}

$stmt = $conn->prepare("
    INSERT INTO events (
        username1,
        date1,
        time1,
        location,
        entityType,
        action,
        status1,
        shutdownType,
        foReason,
        sapOrder,
        ir,
        note,
        hyd
    )
    VALUES (
        :username,
        :date1,
        :time1,
        :location,
        :entityType,
        :action,
        :status1,
        :shutdownType,
        :foReason,
        :sapOrder,
        :ier,
        :note,
        :hyd
    )
");


$stmt->execute([
    ':username'      => htmlspecialchars($input['username'], ENT_QUOTES, 'UTF-8'),
    ':date1'         => $input['eventDate'],
    ':time1'         => $input['eventTime'],
    ':location'      => htmlspecialchars($input['location'], ENT_QUOTES, 'UTF-8'),
    ':entityType'    => 'transformer',

    ':action'        => htmlspecialchars($action, ENT_QUOTES, 'UTF-8'),
    ':status1'       => htmlspecialchars($input['selectStatusMenu'] ?? '', ENT_QUOTES, 'UTF-8'),

    ':shutdownType'  => htmlspecialchars($input['shutdownType'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':foReason'      => htmlspecialchars($input['foReason'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':sapOrder'      => htmlspecialchars($input['sapOrder'] ?? '', ENT_QUOTES, 'UTF-8'),
    ':ier'           => htmlspecialchars($input['IER'] ?? '', ENT_QUOTES, 'UTF-8'),

    ':note'          => htmlspecialchars($eventText, ENT_QUOTES, 'UTF-8'),
    ':hyd'           => htmlspecialchars($input['selectedRatching'] ?? '', ENT_QUOTES, 'UTF-8'),
]);



            $eventId = $conn->lastInsertId();


            $conn->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Transformer operation recorded successfully',
                'id' => $eventId,
                'user' => $input['username']
            ]);

        } catch (PDOException $e) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
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
     * تحديث عملية محول (Transformer)
     */
    public static function updateTransOperation(int $id, array $input): void
    {
        global $conn;

        $requiredFields = [
            'location' => 'string',
            'eventDate' => 'date',
            'eventTime' => 'time',
            'TypeStatus' => 'string'
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
            
            $conn->beginTransaction();

            // Verify event exists
            $stmt = $conn->prepare("
                SELECT id FROM events 
                WHERE id = :id AND entityType = 'transformer' 
            ");
            $stmt->execute([':id' => $id]);
            
            if (!$stmt->fetch()) {
                throw new Exception('Transformer event not found');
            }

            // Update events table
            $stmt = $conn->prepare("
                UPDATE events
                SET date1 = :date1,
                    time1 = :time1,
                    location = :location,
                    action = :action,
                    status1 = :status1,
                    note = :note,
                    updated_at = datetime('now'),
                    updated_by = :updated_by
                WHERE id = :id
            ");

            $stmt->execute([
                ':date1' => $input['eventDate'],
                ':time1' => $input['eventTime'],
                ':location' => htmlspecialchars($input['location'], ENT_QUOTES, 'UTF-8'),
                ':action' => htmlspecialchars($input['OperationData'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':status1' => htmlspecialchars($input['TypeStatus'], ENT_QUOTES, 'UTF-8'),
                ':note' => htmlspecialchars($input['note'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':updated_by' => htmlspecialchars($user['username'], ENT_QUOTES, 'UTF-8'),
                ':id' => $id
            ]);

            // Update transformers table
            $stmt = $conn->prepare("
                UPDATE transformers
                SET status = :status,
                    action = :action,
                    note = :note,
                    last_updated = datetime('now')
                WHERE transformer_number = :transformer_number
            ");

            $stmt->execute([
                ':status' => htmlspecialchars($input['TypeStatus'], ENT_QUOTES, 'UTF-8'),
                ':action' => htmlspecialchars($input['OperationData'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':note' => htmlspecialchars($input['note'] ?? '', ENT_QUOTES, 'UTF-8'),
                ':transformer_number' => htmlspecialchars($input['location'], ENT_QUOTES, 'UTF-8')
            ]);

            $conn->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Transformer operation updated successfully',
                'updated_by' => $user['username']
            ]);

        } catch (Throwable $e) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            self::errorResponse(
                500,
                'Update failed: ' . $e->getMessage(),
                [],
                'UPDATE_FAILED'
            );
        }
    }

    /**
     * إنشاء عملية محول (alias للتوافق)
     */
    public static function createOperation(): void
    {
        self::authenticate();
        $input = json_decode(file_get_contents("php://input"), true);
        self::transformerOperation($input);
    }

    /**
     * تحديث عملية محول (alias للتوافق)
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

        $id = intval($input['id'] ?? 0);

        if (!$id || $id <= 0) {
            self::errorResponse(
                422,
                'Invalid or missing ID',
                [],
                'INVALID_ID'
            );
        }

        self::updateTransformer($id, $input);
    }
}
