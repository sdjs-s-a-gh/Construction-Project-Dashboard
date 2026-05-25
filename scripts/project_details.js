/**
 * Updates the HTML that holds information about a Project's Details.
 * 
 * This function updates all the associated information about a project, including details
 * like the project description and resources required as well as the weather and pollution
 * data at the location.
 * 
 * @param {int} projectID The ID for the project to fetch information about.
 * @param {string} title The title for the project.
 * @param {Number} latitude The Latitude co-ordinate for the project.
 * @param {Number} longitude The Longitude co-ordinate for the project.
 */
async function updateProjectDetails(projectID, title, latitude, longitude) {
    const selectedProject = document.getElementById("project-selected");
    selectedProject.innerHTML = `Project Selected: ${title}`;

    // Set a global state in the HTML code so it can be accessed by the date handlers.
    selectedProject.dataset.latitude = latitude;
    selectedProject.dataset.longitude = longitude;

    // Retrieve the data for the particular project from the database.
    const response = await fetch(`api/api.php?type=project-detailed&project_id=${projectID}`);
    const data = await response.json();

    document.getElementById("project-manager").innerHTML = data[0].manager;
    document.getElementById("project-description").innerHTML = data[0].description;
    document.getElementById("project-location").innerHTML = data[0].location;
    const projectResourcesHTML = document.getElementById("project-resources"); // For each, append the resources to get a list.

    let projectResources = [];
    data.forEach(projectInstance => {
        projectResources.push(projectInstance.resource_type);
    })

    projectResourcesHTML.innerHTML = projectResources.join(", ");

    // Set the conditions for the project about which equipment is NOT to be used.
    await setProjectConditions(latitude, longitude, projectResources);

    // Update the remaining Environmental data for the selected area.
    getHistoricalEnvironmentData(latitude, longitude);
    getFutureWeatherData(latitude, longitude);
    getFuturePollutionData(latitude, longitude);
}

/**
 * Applies a set of rules to give a recommendation on which work cannot proceed based off 
 * environmental data.
 * 
 * This function uses the rules given in the Projects_Database excel spreadsheet 
 * and the assignment brief.
 * @param {Number} latitude The latitude of the selected project's location.
 * @param {Number} longitude The longitude of the selected project's location.
 */
async function setProjectConditions(latitude, longitude, projectResources) {
    const [weatherDescription, windSpeed, weatherID] = await getCurrentWeather(latitude, longitude);
    const airQuality = await getCurrentPollutionData(latitude, longitude);
    const isHighWind = windSpeed > 20;

    // Set the bad weather to the weather codes that represent "heavy intensity rain", "very heavy rain",
    // "extreme rain" and "heavy intensity shower rain". Codes taken from https://openweathermap.org/api/weather-conditions#Weather-Condition-Codes-2 
    const isBadWeather = weatherID === 502 || weatherID === 503 || weatherID === 504 || weatherID === 522;
    const isPoorAirQuality = airQuality > 2;

    // An object of resource rules to iterate through more cleanly.
    // TODO: make the variables a bit better (do they really need a boolean?).
    const resourceRules = {
        "Crane": {
            highWind: true
        },
        "Drill": {
            heavyRain: true
        },
        "Dumper Truck": {
            heavyRain: true,
            poorAirQuality: true
        },
        "Digger": {
            heavyRain: true,
            poorAirQuality: true
        },
        "Loader": {
            heavyRain: true,
            poorAirQuality: true
        },
        "Concrete Mixer": {
            heavyRain: true
        }
    }

    // Booleans to represent which conditions should be displayed back to the user.
    let highWindMsg = false;
    let heavyRainMsg = false;
    let poorAirQualityMsg = false;

    // Iterate through each resource used on the project to determine whether it can be used.
    projectResources.forEach(resource => {
        const rules = resourceRules[resource];

        if (rules?.highWind && isHighWind) {
            highWindMsg = true;
        }

        if (rules?.heavyRain && isBadWeather) {
            heavyRainMsg = true;
        }

        if (rules?.poorAirQuality && isPoorAirQuality) {
            poorAirQualityMsg = true;
        }
    })

    // Update the recommendations tag to show the user which equipment cannot be used.
    let recommendation = "";
    let alternativeRecommendation = "";
    if (highWindMsg) {
        recommendation += `Work with the crane is recommended to be ceased since the current windspeed (${windSpeed}mph) exceeds 20mph.<br>`
    }

    if (heavyRainMsg) {
        recommendation += `Work is recommended to be delayed with any earth-moving equipment, drills and concrete mixers due to current rainfall ${weatherDescription}.<br>`;
    }

    if (poorAirQualityMsg) {
        recommendation += `Work is recommended to be ceased for any earth-moving equipment since the air quality is too low (${airQuality}).<br>`;
    } else {
        alternativeRecommendation = `Work using any earth-moving equipment may be used as the air quality is sufficient ${airQuality} <br>`
    }

    if (!(highWindMsg || heavyRainMsg || poorAirQualityMsg)) {
        recommendation = "All work may proceed."
    } else if (!poorAirQualityMsg && !heavyRainMsg) {
        recommendation += alternativeRecommendation;
    }

    document.getElementById("project-status").innerHTML = recommendation;
}