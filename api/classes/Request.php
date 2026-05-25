<?php

/**
 * Represents an incoming HTTP request.
 * 
 * This class encapsulates the key components of an incoming HTTP request,
 * including the request method, target path, query parameters, body parameters
 * and headers.
 * 
 * @author Scott Berston 
 * Adapted from Year Two: Software Architecture - REST API.
 */
class Request
{     
    /**
     * Returns any query parameters supplied in the request URL.
     * 
     * @return array<string, mixed> An associative array where the keys are the
     * parameter names and the values are their corresponding value.
     */
    public function getQueryParameters(): array
    {
        return $_GET;
    }
}