<?php

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';

header('Content-Type: application/json');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

// ─── ROUTE MAP ───────────────────────────────────────────────────────────────
const ROUTES = [
    // AUTH (لا تحتاج توثيق)
    'fetchAuth'     => ['AuthController',    'fetchAuth'],
    'logout'        => ['AuthController',    'logout'],
    'refreshToken'  => ['AuthController',    'refreshToken'],
    'register'      => ['AuthController',    'register'],
    'verifyToken'   => ['AuthController',    'verifyToken'],
    'hasRefresh'    => ['AuthController',    'hasRefresh'],

    // STATUS
    'getUnitStatus' => ['StatusController',  'getUnitStatus'],
    'getCOTPStatus' => ['StatusController',  'getCOTPStatus'],
    'getFUStatus'   => ['StatusController',  'getFUStatus'],
    'getFT6Status'  => ['StatusController',  'getFT6Status'],
    'getTankStatus' => ['TankController',    'getTankStatus'],
    'getUnitHours'  => ['StatusController',  'getUnitHours'],

    // SEQUENCES
    'getGTSequence'      => ['SequenceController', 'getGTSequence'],
    'updateCpsSequence'  => ['SequenceController', 'updateCpsSequence'],
    'get29ppSequence'    => ['SequenceController', 'get29ppSequence'],
    'update29ppSequence' => ['SequenceController', 'update29ppSequence'],
    'getCotpSequence'    => ['SequenceController', 'getCotpSequence'],
    'updateCotpSequence' => ['SequenceController', 'updateCotpSequence'],

    // EVENTS
    'events'             => ['EventController', 'searchApi'],
    'deleteTodayEvents'  => ['EventController', 'deleteTodayEvents'],
    'deleteEvent'        => ['EventController', 'deleteEvents'],

    // OPERATIONS
    'createUnitOperation'       => ['OperationController',    'operations'],
    'updateUnitOperation'       => ['OperationController',    'updateOperation'],
    'deleteUnitOperation'       => ['OperationController',    'deleteOperation'],   // ✅ كان مفقوداً
    'createTankOperation'       => ['TankController',         'insertToTanks'],
    'updateTankOperation'       => ['TankController',         'updateTank'],
    'deleteTankOperation'       => ['TankController',         'deleteTankEvents'],
    'createTransformerOperation'=> ['TransformerController',  'createTransOperation'],
    'updateTransformerOperation'=> ['TransformerController',  'updateTransOperation'],

    // NOTIFICATIONS
    'createNotification'        => ['NotificationController', 'createNotification'],
    'getNotifications'          => ['NotificationController', 'getNotifications'],
    'updateNotification'        => ['NotificationController', 'updateNotification'],
    'deleteNotification'        => ['NotificationController', 'deleteNotification'],
    'markNotificationRead'      => ['NotificationController', 'markNotificationRead'],
    'markAllNotificationsRead'  => ['NotificationController', 'markAllNotificationsRead'],
    'getNotificationStats'      => ['NotificationController', 'getNotificationStats'],

    // FILES
    'uploadOperationFiles'  => ['UploadController', 'uploadFiles'],
    'listOperationFiles'    => ['UploadController', 'listFiles'],
    'listAllFiles'          => ['UploadController', 'listAllFiles'],
    'downloadOperationFile' => ['UploadController', 'downloadFile'],
    'deleteOperationFile'   => ['UploadController', 'deleteFile'],
    'renameFile'            => ['UploadController', 'renameFile'],
    'moveFile'              => ['UploadController', 'moveFile'],
    'starFile'              => ['UploadController', 'starFile'],
    'getStorageStats'       => ['UploadController', 'getStorageStats'],
    // FOLDERS
    'listFolders'           => ['UploadController', 'listFolders'],
    'createFolder'          => ['UploadController', 'createFolder'],
    'deleteFolder'          => ['UploadController', 'deleteFolder'],
    'renameFolder'          => ['UploadController', 'renameFolder'],
];

// ─── استخراج الـ Route ───────────────────────────────────────────────────────
$action = null;

// 1. PATH_INFO: /api/fetchAuth
if (!empty($_SERVER['PATH_INFO'])) {
    $action = trim($_SERVER['PATH_INFO'], '/');
}

// 2. Query param: ?route=fetchAuth
if (!$action) {
    $action = isset($_GET['route'])  ? explode('?', $_GET['route'])[0]  : null;
    $action = $action ?? (isset($_GET['action']) ? explode('?', $_GET['action'])[0] : null);
}

// 3. JSON body: { "route": "fetchAuth" }
if (!$action) {
    $body   = json_decode(file_get_contents('php://input'), true);
    $action = isset($body['route'])  ? explode('?', $body['route'])[0]  : null;
    $action = $action ?? (isset($body['action']) ? explode('?', $body['action'])[0] : null);
}

if (!$action) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing route parameter']);
    exit;
}

// ─── تنفيذ الـ Route ─────────────────────────────────────────────────────────
if (!isset(ROUTES[$action])) {
    // legacy: dateQuery
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
$controllerFile = __DIR__ . '/controllers/' . $controllerName . '.php';

if (!file_exists($controllerFile)) {
    http_response_code(500);
    echo json_encode(['error' => "Controller file not found: $controllerName"]);
    exit;
}

require_once $controllerFile;

if (!class_exists($controllerName) || !method_exists($controllerName, $methodName)) {
    http_response_code(500);
    echo json_encode(['error' => "Method $controllerName::$methodName not found"]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
call_user_func([$controllerName, $methodName], $input);
