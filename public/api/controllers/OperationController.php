<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/BaseAuthController.php';

class OperationController extends BaseAuthController
{
    private const ALLOWED_TYPES = ['units', 'tank', 'transformer', 'nonestatus'];

    // ─── CREATE ───────────────────────────────────────────────────────────────

    public static function operations(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input      = self::getJsonInput();
        $entityType = strtolower(trim($input['entityType'] ?? ''));

        if (!in_array($entityType, self::ALLOWED_TYPES, true)) {
            self::errorResponse(422, 'Invalid entity type', [
                'allowed'  => self::ALLOWED_TYPES,
                'received' => $entityType,
            ], 'INVALID_ENTITY_TYPE');
        }

        switch ($entityType) {
            case 'units':
                self::unitOperation($input);
                break;
            case 'tank':
                require_once __DIR__ . '/TankController.php';
                TankController::insertToTanks($input);
                break;
            case 'transformer':
                require_once __DIR__ . '/TransformerController.php';
                TransformerController::createTransOperation($input);
                break;
            case 'nonestatus':
                self::insertToEvents($input);
                break;
        }
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    public static function updateOperation(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $input      = self::getJsonInput();
        $entityType = strtolower(trim($input['entityType'] ?? ''));
        $id         = (int)($input['id'] ?? 0);

        if ($id <= 0) {
            self::errorResponse(422, 'Invalid or missing ID', [], 'INVALID_ID');
        }

        switch ($entityType) {
            case 'units':
                self::updateUnit($id, $input);
                break;
            case 'tank':
                require_once __DIR__ . '/TankController.php';
                TankController::updateTank($input);
                break;
            case 'transformer':
                require_once __DIR__ . '/TransformerController.php';
                TransformerController::updateTransOperation($id, $input);
                break;
            default:
                self::errorResponse(422, 'Invalid entity type for update', [], 'INVALID_ENTITY_TYPE');
        }
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    public static function deleteOperation(): void
    {
        self::requireMethod('POST');
        self::authenticate();

        $user       = self::getCurrentUser();
        $input      = self::getJsonInput();
        $entityType = strtolower(trim($input['entityType'] ?? 'units'));
        $eventIds   = $input['event_ids'] ?? [];

        if (empty($eventIds) || !is_array($eventIds)) {
            self::errorResponse(422, 'event_ids array is required', [], 'INVALID_IDS');
        }

        $ids = array_values(array_filter(array_map(fn($id) => (int)$id > 0 ? (int)$id : null, $eventIds)));
        if (empty($ids)) {
            self::errorResponse(422, 'No valid IDs provided', [], 'NO_VALID_IDS');
        }

        global $conn;
        $placeholders = implode(',', array_fill(0, count($ids), '?'));

        try {
            $conn->beginTransaction();

            $stmt = $conn->prepare("SELECT id FROM events WHERE id IN ($placeholders)");
            $stmt->execute($ids);
            $found = $stmt->fetchAll();

            if (empty($found)) {
                $conn->rollBack();
                self::errorResponse(404, 'No events found', [], 'NOT_FOUND');
            }

            $stmt = $conn->prepare("DELETE FROM events WHERE id IN ($placeholders)");
            $stmt->execute($ids);
            $affected = $stmt->rowCount();

            $conn->commit();

            echo json_encode([
                'success'       => true,
                'message'       => "Deleted $affected unit operations",
                'deleted_ids'   => $ids,
                'deleted_by'    => $user['username'],
            ]);
        } catch (PDOException $e) {
            if ($conn->inTransaction()) $conn->rollBack();
            self::errorResponse(500, 'Database error: ' . $e->getMessage(), [], 'DB_ERROR');
        }
    }

    // ─── Private: Unit Operations ─────────────────────────────────────────────

    private static function unitOperation(array $input): void
    {
        global $conn;

        $errors = self::validateFields($input, [
            'location'         => 'string',
            'eventDate'        => 'date',
            'eventTime'        => 'time',
            'selectStatusMenu' => 'string',
        ]);

        if (!empty($errors)) {
            self::errorResponse(422, 'Validation failed', $errors, 'VALIDATION_ERROR');
        }

        $user = self::getCurrentUser();

        $stmt = $conn->prepare("
            INSERT INTO events (
                username1, date1, time1, location, entityType,
                status1, shutdownType, shutdownReason, foReason,
                sapOrder, action, note, hyd, flame, fsnl, synch, gsu, ir
            ) VALUES (
                :username1, :date1, :time1, :location, 'units',
                :status1, :shutdownType, :shutdownReason, :foReason,
                :sapOrder, :action, :note, :hyd, :flame, :fsnl, :synch, :gsu, :ir
            )
        ");

        $stmt->execute([
            ':username1'      => self::s($user['username']),
            ':date1'          => $input['eventDate'],
            ':time1'          => $input['eventTime'],
            ':location'       => self::s($input['location']),
            ':status1'        => self::s($input['selectStatusMenu'] ?? ''),
            ':shutdownType'   => self::s($input['shutdownType'] ?? ''),
            ':shutdownReason' => self::s($input['shutdownReason'] ?? ''),
            ':foReason'       => self::s($input['foReason'] ?? ''),
            ':sapOrder'       => self::s($input['sapOrder'] ?? ''),
            ':action'         => self::s($input['eventText'] ?? ''),
            ':note'           => self::s($input['note'] ?? ''),
            ':hyd'            => self::s($input['selectedRatching'] ?? ''),
            ':flame'          => self::s($input['flameRPM'] ?? ''),
            ':fsnl'           => self::s($input['fsnlTime'] ?? ''),
            ':synch'          => self::s($input['synchTime'] ?? ''),
            ':gsu'            => self::s($input['transformerAction'] ?? ''),
            ':ir'             => self::s($input['IER'] ?? ''),
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Unit operation recorded',
            'id'      => $conn->lastInsertId(),
            'user'    => $user['username'],
        ]);
    }

    private static function insertToEvents(array $input): void
    {
        global $conn;

        $errors = self::validateFields($input, [
            'eventDate' => 'date',
            'eventTime' => 'time',
            'location'  => 'string',
            'eventText' => 'string',
        ]);

        if (!empty($errors)) {
            self::errorResponse(422, 'Validation failed', $errors, 'VALIDATION_ERROR');
        }

        $user = self::getCurrentUser();

        $stmt = $conn->prepare("
            INSERT INTO events (username1, date1, time1, location, entityType, action)
            VALUES (:user, :date, :time, :location, 'nonestatus', :action)
        ");

        $stmt->execute([
            ':user'     => self::s($user['username']),
            ':date'     => $input['eventDate'],
            ':time'     => $input['eventTime'],
            ':location' => self::s($input['location']),
            ':action'   => self::s($input['eventText']),
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Event recorded',
            'id'      => $conn->lastInsertId(),
        ]);
    }

    private static function updateUnit(int $id, array $input): void
    {
        global $conn;

        $errors = self::validateFields($input, [
            'location'         => 'string',
            'eventDate'        => 'date',
            'eventTime'        => 'time',
            'selectStatusMenu' => 'string',
        ]);

        if (!empty($errors)) {
            self::errorResponse(422, 'Validation failed', $errors, 'VALIDATION_ERROR');
        }

        $user = self::getCurrentUser();

        // تحقق أن الحدث موجود
        $check = $conn->prepare("SELECT id FROM events WHERE id = :id AND entityType = 'units'");
        $check->execute([':id' => $id]);
        if (!$check->fetch()) {
            self::errorResponse(404, 'Unit event not found', [], 'NOT_FOUND');
        }

        $now       = date('Y-m-d H:i');
        $updatedBy = self::s($user['username']) . ' ' . $now;

        $stmt = $conn->prepare("
            UPDATE events SET
                username1 = :username1, date1 = :date1, time1 = :time1,
                location = :location, status1 = :status1,
                shutdownType = :shutdownType, shutdownReason = :shutdownReason,
                foReason = :foReason, sapOrder = :sapOrder,
                action = :action, note = :note, hyd = :hyd,
                flame = :flame, fsnl = :fsnl, synch = :synch, gsu = :gsu, ir = :ir,
                updated_by = CASE
                    WHEN updated_by IS NOT NULL AND updated_by != ''
                    THEN updated_by || CHAR(10) || :new_updated_by
                    ELSE :new_updated_by
                END
            WHERE id = :id
        ");

        $stmt->execute([
            ':id'             => $id,
            ':username1'      => self::s($user['username']),
            ':date1'          => $input['eventDate'],
            ':time1'          => $input['eventTime'],
            ':location'       => self::s($input['location']),
            ':status1'        => self::s($input['selectStatusMenu']),
            ':shutdownType'   => self::s($input['shutdownType'] ?? ''),
            ':shutdownReason' => self::s($input['shutdownReason'] ?? ''),
            ':foReason'       => self::s($input['foReason'] ?? ''),
            ':sapOrder'       => self::s($input['sapOrder'] ?? ''),
            ':action'         => self::s($input['eventText'] ?? ''),
            ':note'           => self::s($input['note'] ?? ''),
            ':hyd'            => self::s($input['selectedRatching'] ?? ''),
            ':flame'          => self::s($input['flameRPM'] ?? ''),
            ':fsnl'           => self::s($input['fsnlTime'] ?? ''),
            ':synch'          => self::s($input['synchTime'] ?? ''),
            ':gsu'            => self::s($input['transformerAction'] ?? ''),
            ':ir'             => self::s($input['IER'] ?? ''),
            ':new_updated_by' => $updatedBy,
        ]);

        echo json_encode([
            'success'    => true,
            'message'    => 'Unit operation updated',
            'updated_by' => $user['username'],
        ]);
    }
}
