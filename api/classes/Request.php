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
     * Returns the HTTP method specified in the request.
     * 
     * @return string The request method used to call the API (GET, POST, PATCH, PUT, DELETE or
     * OPTIONS).
     */
    public function getRequestMethod(): string
    {
        return $_SERVER["REQUEST_METHOD"];
    }

    /**
     * Normalises and returns the target endpoint of the request.
     * 
     * This method extracts the requested endpoint from the URL, removing the
     * path as well as any query parameters. The endpoint is additionally converted
     * to lowercase and removes any trailing slashes.
     * 
     * @return string  The lowercase target endpoint.
     */
    public function getEndpointTarget(): string 
    {
        $url = parse_url($_SERVER["REQUEST_URI"]);
        $basepath = "/construction-project-dashboard/api/";    // TODO: Remember to update this basepath
        $endpoint = str_replace($basepath, "", $url["path"]);

        /** 
         * Ensure the endpoint is not case sensitive by normalising the target
         * path to lowercase.
         */ 
        $endpoint = strtolower($endpoint);      

        // Remove any trailing slashes.
        $endpoint = trim($endpoint, "/");
        return $endpoint;
    }
    
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

    /** 
     * //TODO: potentially remove this function as I don't currently see any use for it.
     * If I do remove it, please update the class code comment.
     * 
     * Returns the request body parameters.
     * 
     * @return array<string, mixed>|null An associative array containing the
     * request body parameters or null should the request body not contain any
     * data.
     */
    public function getBodyParameters(): mixed
    {
        $requestBody = file_get_contents("php://input");
        $requestBody = json_decode($requestBody, true);
        return $requestBody;
    }

    /** 
     * Returns all HTTP headers sent with the request.
     * 
     * @return array<string, string> An associative array containing all the
     * headers sent within the request. The keys are the header names and the
     * values are their corresponding values.
     */
    public function getAllHttpHeaders(): array
    {
        // Get all the headers from the request. This is Apache specific code.
        return getallheaders();
    }
}