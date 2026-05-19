<?php

set_exception_handler(function($exception): void
{
    http_response_code(500);
    $data["message"] = $exception->getMessage();
    $data["code"] = $exception->getCode();
    $data["file"] = $exception->getFile();
    $data["line"] = $exception->getLine();    
    echo json_encode($data);
    exit();
});