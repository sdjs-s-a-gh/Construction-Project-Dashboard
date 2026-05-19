<?php
require "exception_handler.php";
require "autoloader.php";
$ENV = require "env.php";


/**
 * Retrieves an OAuth token for the website from Microsoft Azure.
 */
function getAccessToken()
{
    global $ENV;
    $tenantID = $ENV["TENANT_ID"];
    $clientID = $ENV["CLIENT_ID"];
    $clientSecret = $ENV["CLIENT_SECRET"];


    // Retrieve the OAuth token from Microsoft Azure using the Tenant ID of the
    // application registration. 
    $url = "https://login.microsoftonline.com/$tenantID/oauth2/v2.0/token";


    $data = http_build_query([
        "client_id" => $clientID,
        "scope" => "https://vault.azure.net/.default",
        "client_secret" => $clientSecret,
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

    // TODO: Probably fix this print statement
    if ($response === false) {
        echo "Error Response:" + var_dump(error_get_last());
        die("HTTP request failed");
    }
    // TODO: Throw a client error here whenever the response is invalid.  

    $json = json_decode($response, true);

    return $json["access_token"];
}

/**
 * Returns the Secret Key for a given vault and corresponding secret.
 * 
 * An example usage of this function may be to get the API key to for the
 * OpenWeatherData API.
 */
function getSecret($vaultName, $secretName)
{
    $token = getAccessToken();

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

function validateQueryParameters(array $queryParameters, array $requiredParameters): bool
{
    foreach ($requiredParameters as $paramIndex => $paramName) {
        if (!array_key_exists($paramName, $queryParameters)) {
            throw new ClientError("'$paramName' has not been given.", 422);
            return false;
        }
    }

    return true;
}

function handleWeatherCurrent(Request $request, string $apiKey)
{
    $queryParameters = $request->getQueryParameters();

    // TODO: trim the query parameters to remove trailing spaces and make sure lat and lng are integers.

    validateQueryParameters($queryParameters, ["latitude", "longitude"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];

    $url = "https://api.openweathermap.org/data/2.5/weather?lat=$latitude&lon=$longitude&units=metric&appid=$apiKey";

    $options = [
        "http" => [
            "ignore_errors" => true
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    // TODO: Invalid URL because of trailing spaces.

    $response = json_decode($response, true);

    if ($response == null) {
        throw new ClientError("The parameters entered have formed an invalid URL.", 500);
    }

    return $response;
}

/**
 * Returns the weather data within a certain period of time.
 */
function handleWeatherHistorical(Request $request, string $apiKey)
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude", "start_date", "end_date"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];
    $startDate = $queryParameters["start_date"];
    $endDate = $queryParameters["end_date"];

    $url = "https://history.openweathermap.org/data/2.5/history/city?lat=$latitude&lon=$longitude&type=hour&start=$startDate&end=$endDate&units=metric&appid=$apiKey";

    $options = [
        "http" => [
            "ignore_errors" => true
        ]
    ];//

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    $response = json_decode($response, true);

    return $response;
}

function handlePollutionCurrent(Request $request, string $apiKey)
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];

    $url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=$latitude&lon=$longitude&appid=$apiKey";

    $options = [
        "http" => [
            "ignore_errors" => true
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    $response = json_decode($response, true);

    return $response;
}

/**
 * Returns data from the cloud database.
 */
function handlePointsOfInterest()
{
    // TODO: The variables for the code immediately below can be stored in an env file.
    // TODO: Add a try-catch here for the SQL connection. Maybe an asynch call as well with a loading screen.
    // TODO: Could store this data in the Azure Key Vault as well.
    $serverName = "citytourwebsite-wk10-workshop.database.windows.net, 1433";
    $connectionInfo = array(
        "database" => "citytour",
        "uid" => "w23027648",
        "pwd" => "CandBtorture2122"
    );

    // Establish the connection with the SQL database.
    $dbConnection = sqlsrv_connect($serverName, $connectionInfo);
    if ($dbConnection === false) {
        throw new ClientError(sqlsrv_errors(), 404);
    }

    // Retrive all entries from the database.
    $sqlQuery = "SELECT * FROM [dbo].[tblPointsOfInterest]";
    $stmt = sqlsrv_query($dbConnection, $sqlQuery);

    if ($stmt === false) {
        throw new ClientError(sqlsrv_errors(), 404);
    };

    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $data[] = $row;
    }

    sqlsrv_free_stmt($stmt);
    sqlsrv_close($dbConnection);

    return $data;
}

// Handle routing different requests
//$backendApiKey = new ApiKey("1234");
$request = new Request();

// Validate the API Key given to access the backend.
//$backendApiKey->validateApiKey($request->getAllHttpHeaders());

$openWeatherApiKey = getSecret("kv6012-keyvault-d56e8", "OpenWeatherAPIKey");

// Get the endpoint target
//$endpointTarget = $request->getEndpointTarget();
$endpointTarget = $request->getQueryParameters()["type"];

try {
    switch ($endpointTarget) {
        case "weather_current":
            $data = handleWeatherCurrent($request, $openWeatherApiKey);
            break;
        case "weather_historical":
            $data = handleWeatherHistorical($request, $openWeatherApiKey);
            break;
        case "air_pollution_current":   // TODO: For some reason, this is broken.
            $data = handlePollutionCurrent($request, $openWeatherApiKey);
            break;
        case "points_of_interest":
            $data = handlePointsOfInterest();
            break;
        default:
            throw new ClientError("$endpointTarget", 404);
    };

    // Issue with the Open Weather API call.
    if (isset($data["cod"]) && (int) $data["cod"] !== 200) {
        $errorMessage = $data["message"];
        throw new ClientError("$errorMessage", 400);
    } else {
        $statusCode = 200;
    }
} catch (ClientError $clientException) {
    $data = [];
    $data["Error"] = $clientException->getMessage();
    $statusCode = $clientException->getStatusCode();
}

$httpHeaders = ["Access-Control-Allow-Methods" => "GET, OPTIONS"];

// Send the response back to the frontend.
$response = new Response($statusCode, $httpHeaders);
$response->outputJSON($data);
