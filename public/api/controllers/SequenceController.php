<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';

class SequenceController 
{
    private static function fetchSequence($table, $fields, $where, $orderBy)
    {
        global $conn;

        $stmt = $conn->query("
            SELECT $fields
            FROM $table
            WHERE $where
            ORDER BY $orderBy
        ");

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        header('Content-Type: application/json');
        echo json_encode($rows);
    }

    public static function getGTSequence()
    {
        self::fetchSequence(
            "cps",
            "id, location , group_id, sequence",
            "location LIKE 'GT%'",
            "CAST(SUBSTR(sequence, 3) AS INTEGER)"
        );
    }

    public static function get29ppSequence()
    {
        self::fetchSequence(
            "dieselFts",
            "id, location, group_id, sequence",
            "location IS NOT NULL",
            "CAST(SUBSTR(sequence, 4) AS INTEGER)"
        );
    }

    public static function getCotpSequence()
    {
        self::fetchSequence(
            "cotp",
            "id, location, group_id, sequence",
            "location IS NOT NULL",
            "CAST(SUBSTR(sequence, 4) AS INTEGER)"
        );
    }

    // New function: update CPS sequence
public static function updateCpsSequence()
{
    global $conn;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respondError(405, 'Method Not Allowed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        respondError(400, 'Invalid JSON');
    }

    if (empty($input['sequence']) || !is_array($input['sequence'])) {
        respondError(400, 'Sequence data required');
    }

    try {
        $conn->beginTransaction();

        // تحديث الترتيب
        $stmt = $conn->prepare("UPDATE cps SET sequence = :newSeq WHERE id = :id");
        foreach ($input['sequence'] as $item) {
            if (!isset($item['id']) || !isset($item['newSequence'])) continue;
            $stmt->execute([
                'newSeq' => $item['newSequence'],
                'id'     => $item['id'],
            ]);
        }

        // حفظ الملاحظة إذا وجدت
        if (!empty($input['note']) && !empty($input['info'])) {
            $stmtNote = $conn->prepare("INSERT INTO cps (note, info) VALUES (:note, :info)");
            $stmtNote->execute([
                'note' => $input['note'],
                'info' => $input['info'],
               
            ]);
        }

        $conn->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'تم تحديث الترتيب والملاحظة بنجاح'
        ]);

    } catch (Exception $e) {
        $conn->rollBack();
        respondError(500, 'Failed to update sequence and note: ' . $e->getMessage());
    }
}
public static function update29ppSequence()
{
    global $conn;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respondError(405, 'Method Not Allowed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        respondError(400, 'Invalid JSON');
    }

    if (empty($input['sequence']) || !is_array($input['sequence'])) {
        respondError(400, 'Sequence data required');
    }

    try {
        $conn->beginTransaction();

        // تحديث الترتيب
        $stmt = $conn->prepare("UPDATE dieselFts SET sequence = :newSeq WHERE id = :id");
        foreach ($input['sequence'] as $item) {
            if (!isset($item['id']) || !isset($item['newSequence'])) continue;
            $stmt->execute([
                'newSeq' => $item['newSequence'],
                'id'     => $item['id'],
            ]);
        }

        // حفظ الملاحظة إذا وجدت
        if (!empty($input['note']) && !empty($input['info'])) {
            $stmtNote = $conn->prepare("INSERT INTO dieselFts (note, info) VALUES (:note, :info)");
            $stmtNote->execute([
                'note' => $input['note'],
                'info' => $input['info'],
               
            ]);
        }

        $conn->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'تم تحديث الترتيب والملاحظة بنجاح'
        ]);

    } catch (Exception $e) {
        $conn->rollBack();
        respondError(500, 'Failed to update sequence and note: ' . $e->getMessage());
    }
}


public static function updateCotpSequence()
{
    global $conn;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respondError(405, 'Method Not Allowed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        respondError(400, 'Invalid JSON');
    }

    if (empty($input['sequence']) || !is_array($input['sequence'])) {
        respondError(400, 'Sequence data required');
    }

    try {
        $conn->beginTransaction();

        // تحديث الترتيب
        $stmt = $conn->prepare("UPDATE cotp SET sequence = :newSeq WHERE id = :id");
        foreach ($input['sequence'] as $item) {
            if (!isset($item['id']) || !isset($item['newSequence'])) continue;
            $stmt->execute([
                'newSeq' => $item['newSequence'],
                'id'     => $item['id'],
            ]);
        }

        // حفظ الملاحظة إذا وجدت
        if (!empty($input['note']) && !empty($input['info'])) {
            $stmtNote = $conn->prepare("INSERT INTO cotp (note, info) VALUES (:note, :info)");
            $stmtNote->execute([
                'note' => $input['note'],
                'info' => $input['info'],
               
            ]);
        }

        $conn->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'تم تحديث الترتيب والملاحظة بنجاح'
        ]);

    } catch (Exception $e) {
        $conn->rollBack();
        respondError(500, 'Failed to update sequence and note: ' . $e->getMessage());
    }
}
}
