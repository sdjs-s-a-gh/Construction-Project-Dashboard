addEventListener("DOMContentLoaded", () => {
    const map = initMap();
    const markerGroup = L.layerGroup().addTo(map);
    initTableAndMarkers(map, markerGroup);

    // TODO: Decide if I want to keep this code and add the ability to clear markers later.
    // document.getElementById("btn-clear-markers").addEventListener(
    //     "click", function () {
    //         clearAllMarkers(map, markerGroup);
    //     }
    // )
});

function initMap() {
    // Set the coordinates for a certain place
    const centreLatLgn = [54.97874064957384, -1.6100522109054864];

    // Initialise the map and assign it to the div titled "map" programmatically.
    // A zoom of 15x is sufficient to view all projects at first glance.
    const map = L.map("map").setView(centreLatLgn, 15);

    // Ensure the map can actually load the tiles required to make up a single view (a map is based on several images - not just one)
    // Additionally, add the attribution tag to comply with OpenStreetMaps's license.
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "&copy; OpenStreetMap contributors" }
    ).addTo(map);

    return map
}

function createMarker(project, map, markerGroup) {
    const geolocationArray = project.geolocation.split(",");

    // Remove the potential whitespaces from the co-ordinates and convert to integers.
    const lat = parseFloat(geolocationArray[0].trim());
    const lng = parseFloat(geolocationArray[1].trim());
    const markerPosition = [lat, lng];

    // Extract the Name and Description from the table using their <td> tags.
    const projectName = project.title;
    //const poiDescription = pointOfInterest.description;

    const marker = L.marker(markerPosition, {
        title: projectName
    });

    marker.bindTooltip(projectName);

    // TODO: Add more information to this pop-up
    // Format the infoWindowContent for a more aesthetic view.
    const infoWindowContent = `
    <div id=content>
        <h1>${projectName}</h1>
    </div>    
    `;

    marker.bindPopup(infoWindowContent);

    // Append the marker to the current list.
    markerGroup.addLayer(marker);

    marker.on("click", function () {
        updateProjectDetails(project.project_id, projectName, project.geolocation);
    });

    return marker;
}

async function initTableAndMarkers(map, markerGroup) {
    // Get the HTML tag that represents the table so it can be updated.
    const projectsTable = document.getElementById("project-titles");

    const response = await fetch(`api/api.php?type=project-list`);
    const data = await response.json();

    let tableRows = "";
    data.forEach((project) => {
        // Add the row to the table.
        tableRows += `
            <tr id="${project.project_id}" data-geolocation="${project.geolocation}">
                <td>${project.title}</td>
            </tr>
        `
        // Automatically create a map marker from the data.
        createMarker(project, map, markerGroup);
    });

    projectsTable.innerHTML = tableRows;

    // Retrieve more information about a project on-click.
    document.querySelectorAll("#project-titles tr").forEach(row => {
        row.addEventListener("click", function () {
            projectID = row.id;
            projectTitle = row.children[0].innerHTML;
            projectGeolocation = row.dataset.geolocation;
            updateProjectDetails(projectID, projectTitle, projectGeolocation);
            // Update the Current Location
            // document.getElementById("current-location").innerHTML = `${poiName}`;
        })
    })
}

/**
 * Updates the HTML that holds information about a Project's Details.
 * 
 * This function updates all the associated information about a project, including details
 * like the project description and resources required as well as the weather and pollution
 * data at the location. Additionally, a recommendation is computed that determines whether
 * certain resources may be used based off the current environmental data.
 * 
 * @param {int} projectID The ID for the project to fetch information about.
 * @param {string} title The title for the project.
 * @param {string} geolocation The Latitude and Longitude co-ordinates for the project.
 */
async function updateProjectDetails(projectID, title, geolocation) {
    const selectedProject = document.getElementById("project-selected");
    selectedProject.innerHTML = `Project Selected: ${title}`;

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

    projectResourcesHTML.innerHTML = projectResources;

    // Update the Weather for the selected area.
    const latlngArray = geolocation.split(",");

    // Remove the potential whitespaces from the co-ordinates and convert to integers.
    const lat = parseFloat(latlngArray[0].trim());
    const lng = parseFloat(latlngArray[1].trim());
    
    selectedProject.dataset.latitude = lat;
    selectedProject.dataset.longitude = lng;

    const [weatherDescription, windSpeed, weatherID] = await getCurrentWeather(lat, lng);
    const airQuality = await getCurrentPollutionData(lat, lng);
    const isHighWind = windSpeed > 20;

    // Set the bad weather to the weather codes that represent "heavy intensity rain", "very heavy rain",
    // "extreme rain" and "heavy intensity shower rain". Codes taken from https://openweathermap.org/api/weather-conditions#Weather-Condition-Codes-2 
    const isBadWeather = weatherID === 502 || weatherID === 503 || weatherID === 504 || weatherID === 522;
    const isPoorAirQuality = airQuality > 2;

    // An object of resource rules to iterate through more cleanly.
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

    getHistoricalEnvironmentData(lat, lng);
    getFutureWeatherData(lat, lng);
    getFuturePollutionData(lat, lng);
}