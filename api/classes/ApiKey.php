<?php

/**
 * API Key Verifier.
 * 
 * This class is handles the validation and verification of an API key provided
 * by the client. This key is compared against the correct key stored the
 * 'env.php' file.
 * 
 * @author Scott Berston
 */
class ApiKey
{
    private string $apiKey;

    /**
     * Constructs an new ApiKey instance with the correct key.
     * 
     * @param string $apiKey The correct API key to verify against. This key
     * is NOT to be encoded or decoded beforehand.
     */
    public function __construct(string $apiKey)
    {
        $this->setApiKey($apiKey);
    }

    /**
     * Sets the API key.
     * 
     * @param string $api_key The correct API key to compare the incoming
     * response with. This key is NOT to be encoded or decoded beforehand.
     */
    private function setApiKey(string $apiKey): void
    {   
        $this->apiKey = $apiKey;
    }

    /**
     * Validate and verify whether the API key provided by the client matches
     * the one in the env.php file.
     * 
     * This method validates if the API key is provided and is a Bearer token.
     * It then verifies whether the key provided by the client matches the one
     * in the env.php file.
     * 
     * @param array $request_headers An associative array containing the
     * headers sent in the client request.
     * 
     * @throws ClientError
     * - If the Authorization Header is not found
     * - The Header type is invalid
     * - Or the Authorization key is invalid.
     * 
     * @return bool Whether the API key is correct. If it is correct, 'true' is
     * returned. This method should not return 'false' under any circumstance
     * as a ClientError exception should be thrown if any validation fails.
     */
    public function validateApiKey(array $requestHeaders): bool
    {
        // Get the Authorization Header.
        if (array_key_exists("Authorization", $requestHeaders)) {
            $authorization_header = $requestHeaders["Authorization"];
        } elseif (array_key_exists("authorization", $requestHeaders)) {
            $authorization_header = $requestHeaders["Authorization"];
        } else {
            throw new ClientError("Authorization Header is not found.", 401);
            return false;
        }


        // Check if the bearer token is present.
        $header =  substr($authorization_header, 0, 6);
        if ($header != "Bearer") {
            throw new ClientError("Invalid Authorization Header: $header.", 400);
            return false;
        }

        // Extract and decode the API key.
        $clientKey = trim(substr($authorization_header, 7));
        $decodedClientKey = base64_decode($clientKey);

        // Verify the API key.
        if ($this->apiKey != $decodedClientKey) {
            throw new ClientError("The authorization key used is invalid ($clientKey).", 401);
            return false;
        }

        return true;
    }
}