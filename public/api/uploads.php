<?php
// upload.php

// المسار الذي ستخزن فيه الملفات
$targetDir = __DIR__ . "../uploads/operation/forms/";

// تأكد أن المجلد موجود
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$response = [];

if (isset($_FILES['files'])) {
    $files = $_FILES['files'];

    for ($i = 0; $i < count($files['name']); $i++) {
        $filename = basename($files['name'][$i]);
        $targetFile = $targetDir . $filename;

        if (move_uploaded_file($files['tmp_name'][$i], $targetFile)) {
            $response[] = [
                'name' => $filename,
                'status' => 'success'
            ];
        } else {
            $response[] = [
                'name' => $filename,
                'status' => 'error'
            ];
        }
    }
}

header('Content-Type: application/json');
echo json_encode($response);
