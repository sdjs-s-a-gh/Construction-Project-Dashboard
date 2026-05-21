<?php

/**
 * Represents the Azure Key Vault.
 * 
 * This class handles interaction with the Azure and is used to retrieve secrets that are needed
 * within the website.
 */
class AzureKeyVault
{
    private string $tenantID;
    private string $clientID;
    private string $clientSecret;
    private string $accessToken;

    /**
     * Constructs an instance of the Azure Key Vault.
     * 
     * @param array<string, string> $env An associative array that represents environment
     * variables. 
     */
    public function __construct(array $env)
    {
        $this->tenantID = $env["TENANT_ID"];
        $this->clientID = $env["CLIENT_ID"];
        $this->clientSecret = $env["CLIENT_SECRET"];

        $this->setAccessToken();
    }

    /**
     * Retrieves the OAuth access token to allow this website (application) to interact with the
     * Azure Key Vault. 
     */
    private function setAccessToken(): void
    {
        // Retrieve the OAuth token from Microsoft Azure using the Tenant ID of the
        // application registration. 
        $url = "https://login.microsoftonline.com/$this->tenantID/oauth2/v2.0/token";


        $data = http_build_query([
            "client_id" => $this->clientID,
            "scope" => "https://vault.azure.net/.default",
            "client_secret" => $this->clientSecret,
            "grant_type" => "client_credentials"
        ]);

        $options = [
            "http" => [
                "header" => "Content-type: application/x-www-form-urlencoded.",
                "method" => "POST",
                "content" => $data
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);

        // Throw a Server error should there be an issue with accessing the token,
        // such as the website not having access to the Key Vault.
        if ($response === false) {
            throw new ClientError(var_dump(error_get_last()), 500);
        }

        $json = json_decode($response, true);

        // Set the access token from the returned JSON
        $this->accessToken = $json["access_token"];
    }

    /**
     * Returns the Secret Key for a given vault and corresponding secret.
     * 
     * An example usage of this function may be to get the API key to for the
     * OpenWeatherData API.
     * 
     * @param string $vaultName The name of the Azure Key Vault to be accessed.
     * @param string $secretName The name of the secret that is wanting to be retrieved.
     */
    public function getSecret(string $vaultName, string $secretName)
    {
        $token = $this->accessToken;

        $url = "https://$vaultName.vault.azure.net/secrets/$secretName?api-version=7.4";

        $options = [
            "http" => [
                "header" => "Authorization: Bearer $token\r\n"
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);

        $json = json_decode($response, true);
        return $json["value"];
    }
}
