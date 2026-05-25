// TODO: Remove; this is just here for testing
latitude = "54.191";
longitude = "-1.161";

document.addEventListener("DOMContentLoaded", () => {
    // TODO: Remove
    getCurrentWeather(latitude, longitude);
    getCurrentPollutionData(latitude, longitude);
    getHistoricalEnvironmentData(latitude, longitude);
    getFuturePollutionData(latitude, longitude);
    getFutureWeatherData(latitude, longitude);

    document.getElementById("btn-historical-date").addEventListener(
        "click",
        handleHistoricDateSelection
    )
    document.getElementById("btn-future-pollution-date").addEventListener(
        "click",
        handlePollutionSelection
    )
    document.getElementById("btn-future-weather-date").addEventListener(
        "click",
        handleFutureWeatherSelection
    )

})

/**
 * Returns the description of the weather with a corresponding visual icon.
 * 
 * The icons used within this code is based of the icon IDs from:
 * https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
 * 
 * @param {*} weatherDescription 
 * @param {*} weatherID 
 * @returns weatherDescription (string): The weather description formatted with an accompanying icon to visually indicate
 * the weather type.
 */
function formatWeatherDescription(weatherDescription, weatherID) {

    let icon = "";

    // Get the first digit of the weather group code.
    const weatherGroup = Math.floor(weatherID / 100);

    // As some weather types contain different icons to the rest of their weather group,
    // handle them first.
    if (weatherID == 511) {
        icon = ""; // Freezing Rain
    } else if (weatherID == 800) {
        icon = "9728"; // Clear Skies
    } else if (weatherID == 801) {
        icon = "9925"; // Few clouds
    } else {
        const iconDictionary = {
            2: "9928", // Thunderstorm,
            3: "", // Drizzle //TODO: Add these remaining icons.
            5: "9730", // Rain
            6: "9731", // Snowy
            7: "", // "Atmosphere"        
            8: "9729", // Scattered, broken and overcast clouds
        }
        icon = iconDictionary[weatherGroup];
    }

    // Add the icon to the description string.
    weatherDescription = `${weatherDescription} &#${icon};`;
    return weatherDescription;
}

function formatAirQuality(airQualityIndex) {
    // Map each index to its corresponding description.
    const aqiDictionary = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Poor",
        5: "Very Poor"
    }

    // Get the description of the AQI from the dictionary.
    const aqiDescription = aqiDictionary[airQualityIndex];

    // Append the description to the string to return.
    airQualityIndex = `${airQualityIndex} (${aqiDescription})`
    return airQualityIndex
}

async function getCurrentWeather(latitude, longitude) {
    const weatherDescription = document.getElementById("weather-description");
    const weatherTemp = document.getElementById("weather-temp");
    const weatherHumidity = document.getElementById("weather-humidity");
    const weatherWind = document.getElementById("weather-wind");

    // TODO: Add try-catch code to deal with erroneous fetches.
    const response = await fetch(`api/api.php?type=weather_current&latitude=${latitude}&longitude=${longitude}`);

    if (response.status !== 200) {
        weatherDescription.innerText = "Error fetching current weather details."
        weatherTemp.innerText = "-";
        weatherWind.innerText = "-";
        weatherHumidity.innerText = "-";
        return null;
    }

    const data = await response.json();

    // Extract the data for the resource rules and to display to the screen.
    const weatherID = data.weather[0].id; // The type of weather (rain, snow, clear)
    const description = data.weather[0].description;
    const temperature = data.main.temp;
    const windSpeed = data.wind.speed;

    // Display the data into the HTML file for the relevant fields.
    weatherDescription.innerHTML = formatWeatherDescription(description, weatherID);
    weatherTemp.innerText = temperature;
    weatherWind.innerText = windSpeed;
    weatherHumidity.innerText = data.main.humidity;

    return [description, windSpeed, weatherID];
}

async function getCurrentPollutionData(latitude, longitude) {
    const airQualityIndex = document.getElementById("pollution-air-quality");
    const carbonMinoxide = document.getElementById("pollution-carbon-monixide");
    const nitrogenDioxide = document.getElementById("pollution-nitrogen-dioxide");
    const pm10 = document.getElementById("pollution-particulate-10");
    const pm2_5 = document.getElementById("pollution-particulate-2_5");

    const response = await fetch(`api/api.php?type=air_pollution_current&latitude=${latitude}&longitude=${longitude}`);
    if (response.status !== 200) {
        airQualityIndex.innerText = "Error fetching current pollution details."
        carbonMinoxide.innerText = "-";
        nitrogenDioxide.innerText = "-";
        pm10.innerText = "-";
        pm2_5.innerText = "-";
        return null;
    }

    const data = await response.json();

    console.log(data);
    // Display the CO2 data into the HTML file.
    const airQuality = data.list[0].main.aqi;
    airQualityIndex.innerText = formatAirQuality(airQuality);
    carbonMinoxide.innerText = data.list[0].components.co;
    nitrogenDioxide.innerText = data.list[0].components.no2;
    pm10.innerText = data.list[0].components.pm10;
    pm2_5.innerText = data.list[0].components.pm2_5;

    return airQuality;
}

/**
 * Formats pollution data to be updated into an HTML element.
 * 
 * @param {Object} pollutionData The JSON data to be input into the table.
 * @param {string} dateFormat The date format used to index each row.
 */
function formatPollutionData(pollutionData, dateFormat) {
    let tableRows = "";
    let lastDay = "";
    const now = dateFns.format(new Date(), "dd/MM/yyyy")

    pollutionData.list.forEach((element) => {
        const dateTime = dateFns.format(new Date(element.dt * 1000), dateFormat);

        // Only trigger when formatting future data.
        if (dateFormat === "dd/MM/yyyy") {
            // Since the API is hourly and there is no way to change it, ignore instances of the same day.
            if (dateTime === lastDay) return;

            // Advance the date forward.
            lastDay = dateTime;
        }

        tableRows += `
            <tr id=${element.dt}>
                <td>${dateTime}</td>
                <td>${formatAirQuality(element.main.aqi)}</td>
                <td>${element.components.co}</td>
                <td>${element.components.no2}</td>
                <td>${element.components.pm10}</td>
                <td>${element.components.pm2_5}</td>
            </tr>
        `
    })

    return tableRows;
}

/**
 * Formats weather data to be updated into an HTML element.
 * 
 * @param {Object} weatherData The JSON data to be input into the table.
 * @param {string} dateFormat The date format used to index each row.
 */
function formatWeatherData(weatherData, dateFormat) {
    let tableRows = "";

    weatherData.list.forEach((element) => {
        // Convert the date/time from the JSON into a more readable format.
        const dateTime = dateFns.format(new Date(element.dt * 1000), dateFormat);
        tableRows += `
            <tr>
                <td>${dateTime}</td>
                <td>${formatWeatherDescription(element.weather[0].description, element.weather[0].id)}</td>
        `
        // Since the future and historic data APIs differ in their JSON, choose which 
        // table rows to change depending on the API used.
        if (dateFormat === "dd/MM/yyyy") {
            tableRows += `
                <td>${element.temp.min}</td>
                <td>${element.temp.max}</td>
                <td>${element.speed}</td>
            </tr>`
        } else {
            tableRows += `
                <td>${element.main.temp}</td>
                <td>${element.wind.speed}</td>
            </tr>`
        }
    });

    return tableRows;
}

function displayHistoricalData(weatherData, pollutionData) {
    const historicalWeather = document.getElementById("historical-weather");
    const historicalPollution = document.getElementById("historical-pollution");

    if (weatherData !== null && pollutionData !== null) {
        historicalWeather.innerHTML = formatWeatherData(weatherData, "dd/MM/yyyy HH:mm");
        historicalPollution.innerHTML = formatPollutionData(pollutionData, "dd/MM/yyyy HH:mm");
    } else {
        const errorMsg = "Error fetching historic data."
        historicalWeather.innerHTML = errorMsg;
        historicalPollution.innerHTML = errorMsg;
    };
};

/**
 * Sets the historical data to 24 hours ago by default.
 */
async function getHistoricalEnvironmentData(latitude, longitude) {
    // Convert current time to a UNIX timestamp. The following code is adapted from Week 8 Workshop, Part 4.
    const now = Math.floor(Date.now() / 1000);

    const startDate = now - 86400; // 24 hours ago given in seconds (86400).
    const endDate = now;

    const response = await fetch(`api/api.php?type=environment_historical&latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}`);

    let weatherData = null;
    let pollutionData = null;

    if (response.status == 200) {
        [weatherData, pollutionData] = await response.json();
    }

    console.log(weatherData);
    console.log(`Latitude: ${latitude}; Longitude: ${longitude}`);

    displayHistoricalData(weatherData, pollutionData);
}

async function getFutureWeatherData(latitude, longitude, days = 5) {
    const response = await fetch(`api/api.php?type=weather_future&latitude=${latitude}&longitude=${longitude}&days=${days}`);

    // Fallback if the error validation doesn't work, so the user is at least made aware something is wrong.
    if (response.status !== 200) {
        alert("Error fetching weather data for the days selected.")
        return;
    }

    const weatherData = await response.json();
    if (weatherData.length == 0) {
        alert("Error with the latitude and longitude.")
        return;
    }

    console.log(weatherData);
    const futureWeatherData = document.getElementById("future-weather-data");
    futureWeatherData.innerHTML = formatWeatherData(weatherData, "dd/MM/yyyy");
}

async function getFuturePollutionData(latitude, longitude) {
    const response = await fetch(`api/api.php?type=pollution_future&latitude=${latitude}&longitude=${longitude}`);
    const pollutionData = await response.json();

    console.log(pollutionData);

    const futurePollutionData = document.getElementById("future-pollution-data");
    futurePollutionData.innerHTML = formatPollutionData(pollutionData, "dd/MM/yyyy");
}

async function handleHistoricDateSelection() {
    // Prevent the page from actually refreshing to avoid altering the URL and removing the input.
    event.preventDefault();

    // Retrieve the geolocation for the currently-selected project.
    //const [latitude, longitude] = getProjectGeolocation();
    // TODO: remove
    const [latitude, longitude] = ["54.191", "-1.161"];

    console.log(latitude);
    console.log(longitude);

    // Get the date values from HTML.
    const startHTMLValue = document.getElementById("start-date").value;
    const endHTMLValue = document.getElementById("end-date").value;

    if (!startHTMLValue || !endHTMLValue) {
        alert("Please select two dates from the input boxes.")
        return;
    }

    // Convert the dates to a UNIX timestamp
    const startDate = Math.floor(new Date(startHTMLValue).getTime() / 1000);

    // The endDate must add an additional day since it will otherwise only have data from midnight to 1am.
    // Then 2 hours must be taken away - one to return to the previous day and the other is because of daylight savings adding another hour.
    const endDate = Math.floor(new Date(endHTMLValue).getTime() / 1000) + ((60 * 60 * 24) - (60 * 60 * 2));

    // Limit the number of days the user can choose because of the API's restrictions.
    const maxDayRange = 7;
    const differenceInDays = (endDate - startDate) / (60 * 60 * 24) // Convert UNIX (milliseconds) to days before calculating the difference.
    if (differenceInDays > maxDayRange) {
        alert(`You cannot enter dates that are more than ${maxDayRange} days apart.`)
        return;
    } else if (startDate > endDate) {
        alert("The start date must be before the end date.");
        return;
    }

    const currentDatePlusOne = Math.floor(new Date().getTime() / 1000) + (60 * 60 * 24); // Same reasoning as before.
    if (endDate > currentDatePlusOne || startDate > currentDatePlusOne) {
        alert("You cannot enter a date that is in the future.")
        return;
    }

    const response = await fetch(`api/api.php?type=environment_historical&latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}`);

    // Fallback if the error validation doesn't work, so the user is at least made aware something is wrong.
    if (response.status !== 200) {
        alert("Bad request. Please change the dates entered.")
        return;
    };

    const [weatherData, pollutionData] = await response.json();
    if (weatherData.length == 0 || pollutionData.length == 0) {
        alert("Error with the latitude and longitude.") // TODO
        return;
    };

    displayHistoricalData(weatherData, pollutionData);
}

async function handlePollutionSelection() {
    // Prevent the page from actually refreshing to avoid altering the URL and removing the input.
    event.preventDefault();

    // Get the date values from HTML.
    const forecastDateHTML = document.getElementById("future-pollution-date").value;
    const forecastDate = Math.floor(new Date(forecastDateHTML).getTime() / 1000);
    const now = Math.floor(new Date().getTime() / 1000);
    const currentDate = Math.floor(new Date().getTime() / 1000);
    const differenceInDays = Math.ceil((forecastDate - currentDate) / (60 * 60 * 24)); // Rounds upwards as the 'now' variable gets the current time and not the start of the day.

    if (forecastDate <= currentDate) {
        alert("You cannot enter a date prior to today.");
        return;
        // Limit the date to <=4 as the API cannot go further into the future.
    } else if (differenceInDays > 4) {
        alert("You cannot enter a date more than 4 days from now.");
        return;
    };

    // Since all the data is already displayed (because the Pollution API doesn't let you
    // choose the number of days to forecast), remove the days out of range in the table.
    document.querySelectorAll("#future-pollution-data tr").forEach(row => {
        // Get the date of the cell to check whether it needs to be hidden.
        const dateCell = Number(row.id);

        if (dateCell > forecastDate) {
            // Hide the row
            row.style.display = "none";
        } else {
            // Make the row visible again - this is only useful for rows that were hidden.
            row.style.display = "";
        }
    });
}

async function handleFutureWeatherSelection() {
    event.preventDefault();

    //const [latitude, longitude] = getProjectGeolocation();
    // TODO: remove
    const [latitude, longitude] = ["54.191", "-1.161"];

    // Get the date values from HTML.
    const forecastDateHTML = document.getElementById("future-weather-date").value;
    const forecastDate = Math.floor(new Date(forecastDateHTML).getTime() / 1000);
    const currentDate = Math.floor(new Date().getTime() / 1000);
    const differenceInDays = Math.ceil((forecastDate - currentDate) / (60 * 60 * 24)) + 1; // Rounds upwards and adds an extra day since the API always includes the current date.

    if (forecastDate <= currentDate) {
        alert("You cannot enter a date prior to today.");
        return;
    } else if (differenceInDays > 16) {
        alert("You cannot enter a date more than 16 days from now.");
        return;
    };

    // TODO: (Check this comment) Use the pre-existing weather fetch since it can be generalised to change the days.
    getFutureWeatherData(latitude, longitude, differenceInDays);
}

/**
 * Returns the co-ordinates of the selected project in an array, consisting of the latitude
 * and longitude.
 * 
 * @return {Array<Number, Number>} An array consisting of the latitude and longitude.
 */
function getProjectGeolocation() {
    const selectedProject = document.getElementById("project-selected")
    const latitude = selectedProject.dataset.latitude;
    const longitude = selectedProject.dataset.longitude;

    return [latitude, longitude]
}