<?php
/**
 * A front-door script for the backend API.
 * 
 * This script serves as a single area to handle all interactions made to the backend
 * API, allowing secure access to OpenWeather information and the ClientProjects database.
 */

require "exception_handler.php";
require "autoloader.php";
$ENV = require "env.php";

// Create all the objects needed to process a request from the frontend.
$request = new Request();
$azureKeyVault = new AzureKeyVault($ENV);
$openWeatherApiKey = $azureKeyVault->getSecret("kv6012-con-dbd-kv", "OpenWeatherAPIKey");

// $databaseServer = $azureKeyVault->getSecret("kv6012-con-dbd-kv", "DatabaseServerName");
// $databaseName = $azureKeyVault->getSecret("kv6012-con-dbd-kv", "DatabaseName");
// $databaseUID = $azureKeyVault->getSecret("kv6012-con-dbd-kv", "DatabaseUserID");
// $databasePWD = $azureKeyVault->getSecret("kv6012-con-dbd-kv", "DatabasePassword"); // TODO: remove this error
// $database = new Database(
//     $databaseServer,
//     $databaseName,
//     $databaseUID,
//     $databasePWD
// );

// Get the endpoint target
$endpointTarget = $request->getQueryParameters()["type"];

// Handle routing requests to different functions.
try {
    switch ($endpointTarget) {
        case "weather_current":
            $data = handleWeatherCurrent($request, $openWeatherApiKey);            
            break;
        case "air_pollution_current":
            $data = handlePollutionCurrent($request, $openWeatherApiKey);
            break;
        case "environment_historical":
            $data = handleEnvironmentHistorical($request, $openWeatherApiKey);
            break;
        case "weather_future":
            $data = handleWeatherFuture($request, $openWeatherApiKey);
            break;
        case "pollution_future":
            $data = handlePollutionFuture($request, $openWeatherApiKey);
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

    $statusCode = 200;
} catch (ClientError $clientException) {
    $data = [];
    $data["Error"] = $clientException->getMessage();
    $statusCode = $clientException->getStatusCode();
}

// Send the response back to the frontend.
$response = new Response($statusCode, $ENV);
$response->outputJSON($data);

# <----------------- Helper Functions ----------------->
/**
 * Retrieves information from a URL.
 * 
 * This function performs an API call to a given website and decodes the JSON response
 * into a "PHP" value, which may be a single value or an associative array. 
 * 
 * @throws ClientError Throws an exception should there be an issue when fetching 
 * information from an API.
 * 
 * @return array<string, mixed> | mixed An associate array that corresponds to a JSON object.
 * However, a single value may potentially be returned.
 */
function fetchJSON(string $url): array | mixed
{
    $options = [
        "http" => [
            "ignore_errors" => true
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    $response = json_decode($response, true);

    // Throw an error if there was something wrong with the URL which caused it to not send
    // a request.
    if ($response == null) {
        throw new ClientError("The parameters entered have formed an invalid URL.", 500);
    }

    // Issue with the Open Weather API call, which is given with either a "cod" or "code" key.
    if ((isset($response["cod"]) && (int) $response["cod"] !== 200) || (isset($response["code"]) && (int) $response["code"] !== 200)) {
        throw new ClientError($response["message"], 422);
    }    

    return $response;
}

/**
 * Confirms the existence of required parameters to process a request.
 * 
 * @param array<string> $queryParameters An indexed array of parameters given by a request.
 * @param array<string> $requiredParameters An indexed array of parameters needed in order to make
 * a subsequent API call.
 * 
 * @return bool A confirmation of whether each required parameter was present in the request.
 */
function validateQueryParameters(array $queryParameters, array $requiredParameters): bool
{
    foreach ($requiredParameters as $paramIndex => $paramName) {
        if (!array_key_exists($paramName, $queryParameters)) {
            throw new ClientError("'$paramName' has not been given.", 422);
        }
    }

    return true;
}

# <----------------- Weather Data Functions ----------------->
/**
 * Performs a request to the OpenWeather API to retreive information about the current
 * weather.
 * 
 * @param Request $request An instance of the Request class to retrieve the parameters
 * given by the fronend request.
 * @param string $apiKey The OpenWeather API key needed to perform the API call.
 * 
 * @return array<string, mixed> | mixed The response from the API call.
 */
function handleWeatherCurrent(Request $request, string $apiKey): array | mixed
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];

    $url = "https://api.openweathermap.org/data/2.5/weather?lat=$latitude&lon=$longitude&units=metric&appid=$apiKey";
    $response = fetchJSON($url);

    return $response;
}

/**
 * Performs a request to the OpenWeather API to retreive information about the future
 * weather over a set number of days.
 * 
 * @param Request $request An instance of the Request class to retrieve the parameters
 * given by the fronend request.
 * @param string $apiKey The OpenWeather API key needed to perform the API call.
 * 
 * @return array<string, mixed> | mixed The response from the API call.
 */
function handleWeatherFuture(Request $request, string $apiKey): array | null
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude", "days"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];
    $days = $queryParameters["days"];

    $url = "https://api.openweathermap.org/data/2.5/forecast/daily?lat=$latitude&lon=$longitude&cnt=$days&units=metric&appid=$apiKey";
    $response = fetchJSON($url);

    return $response;
}


/**
 * Performs a request to the OpenWeather API to retreive information about historical
 * weather and pollution within a certain timeframe.
 * 
 * @param Request $request An instance of the Request class to retrieve the parameters
 * given by the fronend request.
 * @param string $apiKey The OpenWeather API key needed to perform the API call.
 * 
 * @return array<string, mixed> | mixed The response from the API call.
 */
function handleEnvironmentHistorical(Request $request, string $apiKey): array | null
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude", "start_date", "end_date"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];
    $startDate = $queryParameters["start_date"];
    $endDate = $queryParameters["end_date"];

    $weatherURL = "https://history.openweathermap.org/data/2.5/history/city?lat=$latitude&lon=$longitude&type=hour&start=$startDate&end=$endDate&units=metric&appid=$apiKey";
    $pollutionURL = "http://api.openweathermap.org/data/2.5/air_pollution/history?lat=$latitude&lon=$longitude&start=$startDate&end=$endDate&units=metric&appid=$apiKey";

    $weatherResponse = fetchJSON($weatherURL);
    $pollutionResponse = fetchJSON($pollutionURL);

    return [$weatherResponse, $pollutionResponse];
}

# <----------------- Pollution Data Functions ----------------->
/**
 * Performs a request to the OpenWeather API to retreive information about the current
 * pollution data.
 * 
 * @param Request $request An instance of the Request class to retrieve the parameters
 * given by the fronend request.
 * @param string $apiKey The OpenWeather API key needed to perform the API call.
 * 
 * @return array<string, mixed> | mixed The response from the API call.
 */
function handlePollutionCurrent(Request $request, string $apiKey): array | null
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];

    $url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=$latitude&lon=$longitude&appid=$apiKey";
    $response = fetchJSON($url);

    return $response;
}

/**
 * Performs a request to the OpenWeather API to retreive information about future
 * pollution data.
 * 
 * @param Request $request An instance of the Request class to retrieve the parameters
 * given by the fronend request.
 * @param string $apiKey The OpenWeather API key needed to perform the API call.
 * 
 * @return array<string, mixed> | mixed The response from the API call.
 */
function handlePollutionFuture(Request $request, string $apiKey)
{
    $queryParameters = $request->getQueryParameters();
    validateQueryParameters($queryParameters, ["latitude", "longitude"]);

    $latitude = $queryParameters["latitude"];
    $longitude = $queryParameters["longitude"];

    $url = "https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=$latitude&lon=$longitude&units=metric&appid=$apiKey";
    $response = fetchJSON($url);

    return $response;
}

# <----------------- Database Functions ----------------->
/**
 * Performs a request to the ClientProjects database to retrieve the list of projects. Each projects
 * description and geolocation is also returned to inform the creation of a map marker. 
 * 
 * @param Database $db The ClientProjects database to perform an SQL query on.
 * @return array The list of client projects.
 */
function handleProjectList(Database $db): array
{
    $sqlQuery = "SELECT project_id, title, description, geolocation FROM tblProjects";
    $data = $db->executeSQL($sqlQuery);
         
    return $data;
}

/**
 * Performs a request to the ClientProjects database to retrieve all information about
 * each project. 
 * 
 * @param Request $request An instance of the Request class to retrieve the parameters
 * given by the fronend request.
 * @param Database $db The ClientProjects database to perform an SQL query on.
 * @return array The list of client projects with additional information.
 */
function handleProjectDetailed(Request $request, Database $db): array
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
