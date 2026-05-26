<?php

/**
 * Represents an outgoing HTTP response.
 * 
 * This class encapsulates some key components of a HTTP response, including
 * the status code, headers and the output of JSON data.
 * 
 * Adapted from Year Two: Software Architecture - REST API.
 */
class Response
{

    /**
     * Constructs a new Response instance.
     * 
     * This constructor immediately sets the HTTP status code and headers. Outputting
     * the response to the client is handled separately through the output_JSON() 
     * method.
     * 
     * @param int $statusCode The HTTP status code for the response.
     * @param array<string, string> $env An associative array that represents environment
     * variables to be able to access the allowed origin. 
     */
    public function __construct(int $statusCode, array $env)
    {
        // Set the HTTP status code for the response.
        http_response_code($statusCode);

        // Retrieve the allowed origin for CORS.
        $allowedOrigin = $env["ALLOWED_ORIGIN"];
        $this->outputHeaders($allowedOrigin);
    }

    /** 
     * Sets the response headers.
     * 
     * By default, the "Content-Type", "Content-Language" and "Access-Control-Allow-Origin"
     * headers are the same as the response does not differ between the different API calls.
     * 
     * Additionally, the CORS header is set to allow requests ONLY from the domain
     * http://kv6012-dev-constructiondashboard.switzerlandnorth.cloudapp.azure.com/
     */
    private function outputHeaders(string $allowedOrigin): void 
    {
        // Default headers.
        header("Content-Type: application/json");
        header("Content-language: en");

        // CORS-related header.
        header("Access-Control-Allow-Origin: $allowedOrigin");

        header("Access-Control-Allow-Methods: GET, OPTIONS");
    }  

    /** 
     * Outputs the provided data as a JSON response.
     * 
     * @param mixed $data The data to be output as JSON and sent in  request to the client.
     */
    public function outputJSON($data): void
    {
        $jsonData = json_encode($data);
        echo $jsonData;
    }
}