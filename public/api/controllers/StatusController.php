<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/BaseAuthController.php';

class StatusController extends BaseAuthController
{
    private const TANK_STATUS_MAP = [
        'SERVICE' => 'service',
        'FILLING' => 'filling',
        'FEEDING' => 'feeding',
        'RETURN'  => 'return_back',
        'MAINTENANCE' => 'maintenance'
    ];
    private const ALLOWED_TANK_COLUMNS = ['service', 'filling', 'feeding', 'return_back', 'maintenance'];

    /* ====================
       GET STATUS FUNCTIONS
       ==================== */
    
    /**
     * الحصول على حالة الوحدات
     */
   public static function getUnitStatus(): void
{
    global $conn;

    try {
        // $sql = "
        //     SELECT e.location, e.status1, e.date1, e.time1
        //     FROM events e
        //     INNER JOIN (
        //         SELECT location, MAX(date1 || ' ' || time1) AS max_dt
        //         FROM events
        //         WHERE (
        //             (location GLOB 'GT[0-9][0-9]' AND CAST(SUBSTR(location, 3) AS INTEGER) BETWEEN 16 AND 30)
        //             OR location GLOB 'BS[0-9]*'
        //         )
        //         AND status1 IS NOT NULL AND status1 != ''
        //         GROUP BY location
        //     ) latest 
        //     ON (e.date1 || ' ' || e.time1) = latest.max_dt 
        //     AND TRIM(e.location) = TRIM(latest.location)
        //     WHERE (
        //         (e.location GLOB 'GT[0-9][0-9]' AND CAST(SUBSTR(e.location, 3) AS INTEGER) BETWEEN 16 AND 30)
        //         OR e.location GLOB 'BS[0-9]*'
        //     )
        //     AND e.status1 IS NOT NULL AND e.status1 != ''
        //     ORDER BY 
        //         CASE WHEN e.location GLOB 'GT*' THEN 1 ELSE 2 END,
        //         CAST(SUBSTR(e.location, 3) AS INTEGER)
        // ";
$sql = "
    SELECT e.location, e.status1, e.date1, e.time1
    FROM events e
    INNER JOIN (
        SELECT location, MAX(date1 || ' ' || time1) AS max_dt
        FROM events
        WHERE (
            (
                location GLOB 'GT[0-9][0-9]'
                AND CAST(SUBSTR(location, 3) AS INTEGER) BETWEEN 16 AND 30
            )
            OR location GLOB 'BS[-#][0-9]*'
            OR location GLOB 'DE-[0-9]*'
        )
        AND status1 IS NOT NULL 
        AND status1 != ''
        GROUP BY location
    ) latest 
        ON (e.date1 || ' ' || e.time1) = latest.max_dt 
        AND TRIM(e.location) = TRIM(latest.location)

    WHERE (
        (
            e.location GLOB 'GT[0-9][0-9]'
            AND CAST(SUBSTR(e.location, 3) AS INTEGER) BETWEEN 16 AND 30
        )
        OR e.location GLOB 'BS[-#][0-9]*'
        OR e.location GLOB 'DE-[0-9]*'
    )
    AND e.status1 IS NOT NULL 
    AND e.status1 != ''

    ORDER BY 
        CASE 
            WHEN e.location GLOB 'GT*' THEN 1 
            WHEN e.location GLOB 'BS*' THEN 2
            ELSE 3
        END,

        CASE 
            WHEN e.location GLOB 'GT*'
                THEN CAST(SUBSTR(e.location, 3) AS INTEGER)

            WHEN e.location GLOB 'BS*'
                THEN CAST(
                    REPLACE(
                        REPLACE(e.location, 'BS-', ''),
                    'BS#', '')
                AS INTEGER)

            ELSE CAST(SUBSTR(e.location, 4) AS INTEGER)
        END
";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        header('Content-Type: application/json');
        echo json_encode($rows);

    } catch (PDOException $e) {
        self::errorResponse(500, 'Database error: ' . $e->getMessage(), [], 'DB_ERROR');
    }
}

    /**
     * الحصول على ساعات تشغيل الوحدة
     */
    public static function getUnitHours(): void
    {
        $unit = filter_input(INPUT_GET, 'unit', FILTER_SANITIZE_STRING) ?? 'GT16';
        self::sendUnitRunningHours($unit, "1=1");
    }

    /**
     * الحصول على حالة COTP
     */
    public static function getCOTPStatus(): void
    {
        self::sendLatestStatus(
            "SKID#[0-9] SP#[0-9]",
            "CAST(SUBSTR(e.location, 6, INSTR(e.location, ' ') - 6) AS INTEGER), CAST(SUBSTR(e.location, INSTR(e.location, 'SP#') + 3) AS INTEGER)"
        );
    }

    /**
     * الحصول على حالة FUS
     */
    public static function getFUStatus(): void
    {
        self::sendLatestStatus(
            "FUS#*",
            "CAST(REPLACE(REPLACE(REPLACE(SUBSTR(e.location, 5), '(A)', ''), '(B)', ''), '#', '') AS INTEGER), e.location",
            "(e.location GLOB 'FUS#[1-9]' OR e.location GLOB 'FUS#[1-9][0-9]' OR e.location GLOB 'FUS#[1-9](A)' OR e.location GLOB 'FUS#[1-9](B)' OR e.location GLOB 'FUS#[1-9][0-9](A)' OR e.location GLOB 'FUS#[1-9][0-9](B)')"
        );
    }

    /**
     * الحصول على حالة FT6
     */
    public static function getFT6Status(): void
    {
        self::sendLatestStatus(
            "BOP-29 SP#[0-9]",
            "CAST(SUBSTR(e.location, INSTR(e.location, 'SP#') + 3) AS INTEGER)"
        );
    }

    /**
     * الحصول على حالة الخزانات
     */
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
                
                foreach (self::TANK_STATUS_MAP as $status => $column) {
                    if (!empty($row[$column])) {
                        $statuses[] = $status;
                    }
                }
                
                if (empty($statuses)) {
                    $statuses[] = 'SETTLING';
                }
                
                $result[] = [
                    'location' => $row['location'],
                    'status1' => $statuses
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

    /* ====================
       PRIVATE HELPER FUNCTIONS
       ==================== */

    /**
     * إرسال آخر حالة
     */
    private static function sendLatestStatus(
        string $locationPattern, 
        string $orderBy, 
        string $additionalWhere = "1=1", 
        string $groupBy = "location"
    ): void {
        global $conn;

        try {
            // قائمة orderBy المسموحة
            $allowedOrderByPatterns = [
                "CAST(SUBSTR(e.location, 3) AS INTEGER)",
                "CAST(SUBSTR(e.location, 6, INSTR(e.location, ' ') - 6) AS INTEGER), CAST(SUBSTR(e.location, INSTR(e.location, 'SP#') + 3) AS INTEGER)",
                "CAST(REPLACE(REPLACE(REPLACE(SUBSTR(e.location, 5), '(A)', ''), '(B)', ''), '#', '') AS INTEGER), e.location",
                "CAST(SUBSTR(e.location, INSTR(e.location, 'SP#') + 3) AS INTEGER)",
                "location",
                "date1",
                "time1",
                "status1"
            ];
            
            // التحقق من أن orderBy مسموح به
            $isAllowed = in_array($orderBy, $allowedOrderByPatterns, true);
            
            if (!$isAllowed) {
                // التحقق من البنية الأساسية
                $allowedKeywords = ['CAST', 'SUBSTR', 'INSTR', 'REPLACE', 'AS INTEGER', 'location', 'date1', 'time1', 'status1', ',', '(', ')', ' '];
                $temp = $orderBy;
                foreach ($allowedKeywords as $keyword) {
                    $temp = str_replace($keyword, '', $temp);
                }
                $temp = trim($temp);
                
                if (!empty($temp)) {
                    throw new InvalidArgumentException('Invalid order by parameter: ' . $orderBy);
                }
            }

            // نفس التحقق لـ groupBy
            $allowedGroupBy = ['location', 'status1', 'date1'];
            if (!in_array($groupBy, $allowedGroupBy, true)) {
                $groupBy = 'location'; // قيمة افتراضية
            }

            // بناء SQL
            $sql = "
                SELECT e.location, e.status1, e.date1, e.time1
                FROM events e
                INNER JOIN (
                    SELECT location, MAX(date1 || ' ' || time1) AS max_dt
                    FROM events
                    WHERE location GLOB :pattern
                    AND status1 IS NOT NULL
                    AND status1 != ''
                    GROUP BY $groupBy
                ) latest
                ON (e.date1 || ' ' || e.time1) = latest.max_dt 
                AND TRIM(e.location) = TRIM(latest.location)
                WHERE e.location GLOB :pattern 
                AND $additionalWhere 
                AND e.status1 IS NOT NULL 
                AND e.status1 != ''
                ORDER BY $orderBy
            ";

            $stmt = $conn->prepare($sql);
            $stmt->execute([':pattern' => $locationPattern]);
            
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            header('Content-Type: application/json');
            echo json_encode($rows);
            
        } catch (Exception $e) {
            self::errorResponse(
                500,
                'Failed to get status: ' . $e->getMessage(),
                [
                    'locationPattern' => $locationPattern,
                    'orderBy' => $orderBy,
                    'additionalWhere' => $additionalWhere
                ],
                'STATUS_FETCH_ERROR'
            );
        }
    }

    /**
     * إرسال ساعات تشغيل الوحدة
     */
    private static function sendUnitRunningHours(string $locationPattern, string $additionalWhere = "1=1"): void
    {
        global $conn;

        try {
            $stmt = $conn->prepare("
                SELECT date1, time1, action, status1
                FROM events
                WHERE location GLOB :pattern 
                AND $additionalWhere
                ORDER BY date1, time1
            ");
            
            $stmt->execute([':pattern' => $locationPattern]);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $totalSeconds = 0;
            $startTime = null;

            foreach ($logs as $log) {
                $timestamp = strtotime(trim($log['date1'] . ' ' . $log['time1']));
                if (!$timestamp) {
                    continue;
                }

                $action = strtoupper($log['action'] ?? '');
                $status = strtoupper($log['status1'] ?? '');

                if (($status === 'IN SERVICE' || stripos($action, 'STARTED') !== false) && $startTime === null) {
                    $startTime = $timestamp;
                }

                if (($status === 'STAND BY' || $status === 'SHUTDOWN' || stripos($action, 'STOPPED') !== false) && $startTime !== null) {
                    if ($timestamp > $startTime) {
                        $totalSeconds += $timestamp - $startTime;
                    }
                    $startTime = null;
                }
            }

            // If still running, calculate until now
            if ($startTime !== null) {
                $totalSeconds += time() - $startTime;
            }

            $hours = floor($totalSeconds / 3600);
            $minutes = floor(($totalSeconds % 3600) / 60);
            $seconds = $totalSeconds % 60;

            header('Content-Type: application/json');
            echo json_encode([
                'unit' => $locationPattern,
                'total_seconds' => $totalSeconds,
                'hours' => $hours,
                'minutes' => $minutes,
                'seconds' => $seconds,
                'formatted' => sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds)
            ]);
            
        } catch (PDOException $e) {
            self::errorResponse(
                500,
                'Failed to calculate running hours: ' . $e->getMessage(),
                [],
                'RUNNING_HOURS_ERROR'
            );
        }
    }
}
