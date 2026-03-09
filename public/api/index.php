<?php
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

// ============================================================
// 📋 ROUTE MAP
// ============================================================
const ROUTES = [
    /* AUTH ENDPOINTS (لا تحتاج توثيق) */
    'fetchAuth' => ['AuthController', 'fetchAuth'],
    'logout' => ['AuthController', 'logout'],
    'refreshToken' => ['AuthController', 'refreshToken'],
    'register' => ['AuthController', 'register'],
    'verifyToken' => ['AuthController', 'verifyToken'],
    'hasRefresh' => ['AuthController', 'hasRefresh'],

    /* UNITS STATUS ENDPOINTS */
    'getUnitStatus' => ['StatusController', 'getUnitStatus'],
    'getCOTPStatus' => ['StatusController', 'getCOTPStatus'],
    'getFUStatus' => ['StatusController', 'getFUStatus'],
    'getFT6Status' => ['StatusController', 'getFT6Status'],
    'getTankStatus' => ['TankController', 'getTankStatus'],
    'getUnitHours' => ['StatusController', 'getUnitHours'],

    /* SEQUENCES ENDPOINTS */
    'getGTSequence' => ['SequenceController', 'getGTSequence'],
    'updateCpsSequence' => ['SequenceController', 'updateCpsSequence'],
    'get29ppSequence' => ['SequenceController', 'get29ppSequence'],
    'update29ppSequence' => ['SequenceController', 'update29ppSequence'],
    'getCotpSequence' => ['SequenceController', 'getCotpSequence'],
    'updateCotpSequence' => ['SequenceController', 'updateCotpSequence'],

    /* EVENTS ENDPOINTS */
    'events' => ['EventController', 'searchApi'],
    'deleteTodayEvents' => ['EventController', 'deleteTodayEvents'],
    'deleteEvent'  => ['EventController', 'deleteEvents'],

    /* OPERATIONS ENDPOINTS */
    // 'createUnitOperation' => ['UnitController', 'createOperation'],
    'createUnitOperation' => ['OperationController', 'operations'],
    'updateUnitOperation' => ['OperationController', 'updateOperation'],
    'createTankOperation' => ['TankController', 'insertToTanks'],
    'updateTankOperation' => ['TankController', 'updateTank'],
    'deleteTankOperation' => ['TankController', 'deleteTankEvents'],
    'createTransformerOperation' => ['TransformerController', 'createTransOperation'],
    'updateTransformerOperation' => ['TransformerController', 'updateTransOperation'],

    /* FILES ENDPOINTS */
    'uploadOperationFiles' => ['FileController', 'uploadFiles'],
    'listOperationFiles' => ['FileController', 'listFiles'],
    'downloadOperationFile' => ['FileController', 'downloadFile'],
    'deleteOperationFile' => ['FileController', 'deleteFile'],

    /* DATA ENDPOINTS */
    'fetchData' => ['DataController', 'fetchData'],
    'getDcs' => ['DataController', 'getDcs'],
];

// ============================================================
// 🎯 EXTRACT ROUTE - Works with GET, POST, and PATH_INFO
// ============================================================

// Method 1: Try PATH_INFO (from URL rewrite)
$action = null;

// From PATH_INFO: /api/fetchAuth
if (!empty($_SERVER['PATH_INFO'])) {
    $action = trim($_SERVER['PATH_INFO'], '/');
}

// Method 2: Try query parameter (?route= or ?action=)
if (!$action) {
    $action = $_GET['route'] ?? $_GET['action'] ?? null;
    $action = explode('?', $action)[0];

}

// Method 3: Try request body (for POST with JSON)
if (!$action) {
    $body = json_decode(file_get_contents('php://input'), true);
    $action = $body['route'] ?? $body['action'] ?? null;
    $action = explode('?', $action)[0];

}

if (!$action) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing route parameter']);
    exit;
}

// ============================================================
// 🔍 VALIDATE & EXECUTE ROUTE
// ============================================================
if (!isset(ROUTES[$action])) {
    // Special case: dateQuery
    if (isset($_GET['dateQuery'])) {
        require_once __DIR__ . '/controllers/EventController.php';
        EventController::dateQuery();
        exit;
    }
    
    http_response_code(404);
    echo json_encode(['error' => 'Route not found', 'route' => $action]);
    exit;
}

[$controllerName, $methodName] = ROUTES[$action];

// Load controller
$controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';

if (!file_exists($controllerFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'Controller not found']);
    exit;
}

require_once $controllerFile;

if (!class_exists($controllerName)) {
    http_response_code(500);
    echo json_encode(['error' => 'Controller class not found']);
    exit;
}

if (!method_exists($controllerName, $methodName)) {
    http_response_code(500);
    echo json_encode(['error' => 'Method not found']);
    exit;
}

// Execute - pass input data for methods that need it
$input = json_decode(file_get_contents('php://input'), true);
call_user_func([$controllerName, $methodName], $input);
