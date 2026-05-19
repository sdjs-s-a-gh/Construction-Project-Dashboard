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
     * @param int $httpHeaders An associative array of HTTP response headers,
     * where the key is the header name and the value is the header value.
     */
    public function __construct(int $statusCode, array $httpHeaders)
    {
        $this->outputStatusCode($statusCode);
        $this->outputHeaders($httpHeaders);
    }

    /**
     * Sets the HTTP status code for the response.
     * 
     * @param $status_code The HTTP status code for the response.
     */
    private function outputStatusCode($statusCode): void
    {
        http_response_code($statusCode);
    }

    /** 
     * Sets the response headers.
     * 
     * By default, the "Content-Type", "Content-Language" and
     * "Access-Control-Allow-Origin" headers are set as they are universal for
     * each potential response from an endpoint. Additionally, the CORS header
     * is set to allow requests ONLY from the domain
     * http://kv6012-workshops.switzerlandnorth.cloudapp.azure.com
     * 
     * @param array<string, string> $httpHeaders An associative array of
     * custom response headers.
     */
    private function outputHeaders($httpHeaders): void 
    {
        // Default headers.
        header("Content-Type: application/json");
        header("Content-language: en");

        // CORS-related header.
        header("Access-Control-Allow-Origin: http://kv6012-workshops.switzerlandnorth.cloudapp.azure.com");

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