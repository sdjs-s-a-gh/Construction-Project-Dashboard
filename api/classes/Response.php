<?php

/**
 * Represents an outgoing HTTP response.
 * 
 * This class encapsulates some key components of a HTTP response, including
 * the status code, headers and the output of JSON data.
 * 
 * @author Scott Berston
 * Adapted from Year Two: Software Architecture - REST API.
 */
class Response
{

    /**
     * Constructs a new Response instance.
     * 
     * This constructor immediately sets the HTTP status code and headers.
     * Outputting the response to the client is handled separately through
     * the output_JSON() method.
     * 
     * @param int $statusCode The HTTP status code for the response.
     * @param array<string, string> $env An associative array that represents environment
     * variables to be able to access the allowed origin. 
     */
    public function __construct(int $statusCode, array $env)
    {
        // Set the HTTP status code for the response.
        http_response_code($statusCode);
        $allowedOrigin = $env["ALLOWED_ORIGIN"];
        $this->outputHeaders($allowedOrigin);
    }



    /** 
     * Sets the response headers.
     * 
     * By default, the "Content-Type", "Content-Language" and
     * "Access-Control-Allow-Origin" headers are set as they are universal for
     * each potential response from an endpoint. Additionally, the CORS header
     * is set to allow requests ONLY from the domain
     * http://kv6012-workshops.switzerlandnorth.cloudapp.azure.com
     */
    private function outputHeaders(string $allowedOrigin): void 
    {
        // Default headers.
        header("Content-Type: application/json");
        header("Content-language: en");

        // CORS-related header.
        header("Access-Control-Allow-Origin: $allowedOrigin");

        $httpHeaders = ["Access-Control-Allow-Methods" => "GET, OPTIONS"];

        // Add custom headers to the response.
        foreach ($httpHeaders as $headerName=>$headerValue) {
            header("$headerName: $headerValue");
        }
    }  

    /** 
     * Outputs the provided data as a JSON response.
     * 
     * @param mixed $data The data to be output as JSON and sent in the
     * request to the client.
     */
    public function outputJSON($data): void
    {
        $jsonData = json_encode($data);
        echo $jsonData;
    }
}