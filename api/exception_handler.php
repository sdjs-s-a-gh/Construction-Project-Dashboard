<?php

/** 
 * Sets a global exception handler to catch all runtime errors.
 * 
 * This script automatically catches issues that would not otherwise
 * be caught using the defined ClientError exception, issuing where and
 * how an error occurred.
 *  
 * Adapted from Year Two: Software Architecture - REST API.
 */
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