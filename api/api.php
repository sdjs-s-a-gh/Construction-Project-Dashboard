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
 * Returns the weather and pollution data within a certain period of time.
 */
function handleEnvironmentHistorical(Request $request, string $apiKey)
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude", "start_date", "end_date"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];
    $startDate = $queryParameters["start_date"];
    $endDate = $queryParameters["end_date"];

    $weatherURL = "https://history.openweathermap.org/data/2.5/history/city?lat=$latitude&lon=$longitude&type=hour&start=$startDate&end=$endDate&units=metric&appid=$apiKey";
    $pollutionURL = "http://api.openweathermap.org/data/2.5/air_pollution/history?lat=$latitude&lon=$longitude&start=$startDate&end=$endDate&units=metric&appid=$apiKey";

    $options = [
        "http" => [
            "ignore_errors" => true
        ]
    ];

    $context = stream_context_create($options);
    $weatherResponse = file_get_contents($weatherURL, false, $context);
    $pollutionResponse = file_get_contents($pollutionURL, false, $context);

    $weatherResponse = json_decode($weatherResponse, true);
    $pollutionResponse = json_decode($pollutionResponse, true);

    return [$weatherResponse, $pollutionResponse];
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
 * Returns the weather for up-to the next 8 days.
 */
function handleWeatherFuture(Request $request, string $apiKey)
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude", "days"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];
    $days = $queryParameters["days"];

    $url = "https://api.openweathermap.org/data/2.5/forecast/daily?lat=$latitude&lon=$longitude&cnt=$days&units=metric&appid=$apiKey";

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
 * Returns the list of projects from the cloud database with sufficient data for a table.
 */
function handleProjectList(Database $db)
{
    $sqlQuery = "SELECT project_id, title, geolocation FROM tblProjects";
    $data = $db->executeSQL($sqlQuery);

    return $data;
}

function handleProjectDetailed(Request $request, Database $db) 
{
    $sqlQuery = "SELECT tblProjects.project_id, tblProjects.description, tblProjects.manager,
        tblProjects.location, tblResources.resource_type 
        FROM tblProjects
        INNER JOIN tblProjectResources ON tblProjects.project_id = tblProjectResources.project_id
        INNER JOIN tblResources ON tblResources.resource_id = tblProjectResources.resource_id
        WHERE tblProjects.project_id = ?";
    
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["project_id"]);

    // Convert the Project ID into an array to be used as a parameter.
    $projectID = [$queryParameters["project_id"]];    
    $data = $db->executeSQL($sqlQuery, $projectID);

    return $data;
}

// Handle routing different requests
//$backendApiKey = new ApiKey("1234");
$request = new Request();
$database = new Database(
    "citytourwebsite-wk10-workshop.database.windows.net, 1433",
    "citytour",
    "w23027648",
    "CandBtorture2122"
);

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
        case "air_pollution_current":   // TODO: For some reason, this is broken. I don't think it is.
            $data = handlePollutionCurrent($request, $openWeatherApiKey);
            break;
        case "environment_historical":
            $data = handleEnvironmentHistorical($request, $openWeatherApiKey);
            break;
        case "weather_future":
            $data = handleWeatherFuture($request, $openWeatherApiKey);
            break;
        case "project-list":
            $data = handleProjectList($database);
            break;
        case "project-detailed":
            $data = handleProjectDetailed($request, $database);
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
