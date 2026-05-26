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
        handleFuturePollutionSelection
    )
    document.getElementById("btn-future-weather-date").addEventListener(
        "click",
        handleFutureWeatherSelection
    )

})

/**
 * Formats the description of the weather with a corresponding visual icon.
 * 
 * This function maps a weather ID of the location to a UTF-8 miscellaneous icon
 * to more aesthetically represent the weather type.
 * The icons used within this code are based of the weather IDs from:
 * https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2
 * Conversely, the UTF-9 icons themselves can be found at:
 * https://www.w3schools.com/charsets/ref_utf_symbols.asp
 * 
 * @param {String} weatherDescription The description of the weather given by the OpenWeather API.
 * @param {Int} weatherID The ID of the current weather to match an icon to.
 * @returns string The weather description formatted with an accompanying icon to visually indicate
 * the weather type.
 */
function formatWeatherDescription(weatherDescription, weatherID) {  
    // Get the first digit of the weather group code.
    const weatherGroup = Math.floor(weatherID / 100);

    let icon = "";

    // As some weather types contain different icons to the rest of their weather group,
    // handle them first.
    if (weatherID == 800) {
        icon = "9728"; // Clear Skies
    } else if (weatherID == 801) {
        icon = "9925"; // Few clouds
    } else {
        const iconDictionary = {
            2: "9928", // Thunderstorm,
            3: "9730", // Drizzle
            5: "9730", // Rain
            6: "9731", // Snowy
            7: "9926", // "Atmosphere"        
            8: "9729", // Scattered, broken and overcast clouds
        }
        icon = iconDictionary[weatherGroup];
    }

    // Add the icon to the description string.
    weatherDescription = `${weatherDescription} &#${icon};`;
    return weatherDescription;
}

/**
 * Formats the Air Quality Index (AQI) to a more readable and intuitive description.
 * 
 * The codes for the AQI and their description can be found at:
 * https://openweathermap.org/api/air-pollution?collection=environmental#concept 
 * @param {*} airQualityIndex 
 * @returns 
 */
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

/**
 * Retrieves the current weather data about a specific location.
 * 
 * This function indirectly calls the OpenWeather API to update information including the weather
 * description, temperature, humidity and wind speed. 
 * 
 * @param {Number} latitude The latitude of a location.
 * @param {Number} longitude The longitude of a location.
 * @returns {Array | null} An array including the weather description, windspeed and
 * weather ID. Alternatively, null will be returned should there be an error fetching
 * the weather data. 
 */
async function getCurrentWeather(latitude, longitude) {
    const weatherDescription = document.getElementById("weather-description");
    const weatherTemp = document.getElementById("weather-temp");
    const weatherHumidity = document.getElementById("weather-humidity");
    const weatherWind = document.getElementById("weather-wind");

    const data = await fetchJSON(`api/api.php?type=weather_current&latitude=${latitude}&longitude=${longitude}`);

    if (data === null) {
        weatherDescription.innerText = "Error fetching current weather details."
        weatherTemp.innerText = "-";
        weatherWind.innerText = "-";
        weatherHumidity.innerText = "-";
        return null;
    }

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

/**
 * Retrieves the current pollution data about a specific location.
 * 
 * This function indirectly calls the OpenWeather API to update pollution-related information,
 * including the air quality index, carbon minoxide, nitrogen dioxide, pm10 and pm2.5 readings.
 * 
 * @param {Number} latitude The latitude of a location.
 * @param {Number} longitude The longitude of a location.
 * @returns {Int} The Air Quality Index of the current location.
 */
async function getCurrentPollutionData(latitude, longitude) {
    // Retrieve the relevant HTML elements to update.
    const airQualityIndex = document.getElementById("pollution-air-quality");
    const carbonMinoxide = document.getElementById("pollution-carbon-monixide");
    const nitrogenDioxide = document.getElementById("pollution-nitrogen-dioxide");
    const pm10 = document.getElementById("pollution-particulate-10");
    const pm2_5 = document.getElementById("pollution-particulate-2_5");

    const data = await fetchJSON(`api/api.php?type=air_pollution_current&latitude=${latitude}&longitude=${longitude}`);

    if (data === null) {
        airQualityIndex.innerText = "Error fetching current pollution details."
        carbonMinoxide.innerText = "-";
        nitrogenDioxide.innerText = "-";
        pm10.innerText = "-";
        pm2_5.innerText = "-";
        return null;
    };

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
 * Formats the weather data into a table to be rendered onto the HTML page.
 * 
 * This function creates the HTML structure required to format both historic
 * and future weather data.
 * 
 * @param {Object} weatherData The JSON data to returned from the OpenWeather API to be
 * input into the table.
 * @param {string} dateFormat The date format used to index each row.
 * @returns {string} The table rows to be used to form a pollution table.
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

        // If the future data API is used.
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

/**
 * Formats the pollution data into a table to be rendered onto the HTML page.
 * 
 * This function creates the HTML structure required to format both historic
 * and future pollution data.
 * 
 * @param {Object} pollutionData The JSON data to returned from the OpenWeather API to be
 * input into the table.
 * @param {string} dateFormat The date format used to index each row.
 * @returns {string} The table rows to be used to form a pollution table.
 */
function formatPollutionData(pollutionData, dateFormat) {
    let tableRows = "";
    let lastDay = "";   // This variable is only used should the function be handling a future date.

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
            <tr id="${element.dt}">
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
 * Updates the HTML elements to render the historic weather and pollution data onto the website.
 * 
 * @param {string} weatherData The formatted weather data in a tablular structure.
 * @param {string} pollutionData The formatted pollution data in a tablular structure.
 */
function displayHistoricalData(weatherData, pollutionData) {
    const historicalWeather = document.getElementById("historical-weather");
    const historicalPollution = document.getElementById("historical-pollution");

    if (weatherData !== null && pollutionData !== null) {
        historicalWeather.innerHTML = formatWeatherData(weatherData, "dd/MM/yyyy HH:mm");
        historicalPollution.innerHTML = formatPollutionData(pollutionData, "dd/MM/yyyy HH:mm");
    } else {
        // Render an error onto the screen should there be an issue from fetching the data.
        const errorMsg = "Error fetching historic data."
        historicalWeather.innerHTML = errorMsg;
        historicalPollution.innerHTML = errorMsg;
    };
};

/**
 * Retrieves the historic environmental data for a particular location to render onto the
 * website. 
 * 
 * This function indirectly calls the OpenWeather API to fetch both weather and pollution
 * data simulateneously. By default, the data used will be from the previous 24 hours.
 * 
 * @param {Number} latitude The latitude of a location.
 * @param {Number} longitude The longitude of a location. 
 */
async function getHistoricalEnvironmentData(latitude, longitude) {
    // Convert current time to a UNIX timestamp. The following code is adapted from Week 8 Workshop, Part 4.
    const now = Math.floor(Date.now() / 1000);

    const startDate = now - 86400; // 24 hours ago given in seconds (86400).
    const endDate = now;

    const data = await fetchJSON(`api/api.php?type=environment_historical&latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}`);

    let weatherData = null;
    let pollutionData = null;

    // Update the weather and pollution data with their proper values should there not be
    // an error fetching the data.
    if (data !== null) {
        [weatherData, pollutionData] = data;
    };

    displayHistoricalData(weatherData, pollutionData);
}

/**
 * Retrieves the future weather data for a particular location to be rendered onto the website.
 * 
 * This function indirectly calls the OpenWeather API to get future weather data about a location.
 * By default, the 'days' parameter is given the value of 5 to automatically be equal to the same
 * number of days as the future pollution data.
 * @param {Number} latitude The latitude of a location.
 * @param {Number} longitude The longitude of a location.
 * @param {Int} days The number of days into the future to fetch information about.
 */
async function getFutureWeatherData(latitude, longitude, days = 5) {
    const weatherData = await fetchJSON(`api/api.php?type=weather_future&latitude=${latitude}&longitude=${longitude}&days=${days}`);
    const futureWeatherData = document.getElementById("future-weather-data");

    // Fallback if the error validation doesn't work, so the user is at least made aware something is wrong.
    if (weatherData === null) {
        futureWeatherData.innerHTML = "Error fetching future weather data.";
        return;
    } else if (weatherData.length == 0) {
        alert("Error with the latitude and longitude.")
        return;
    }

    futureWeatherData.innerHTML = formatWeatherData(weatherData, "dd/MM/yyyy");
}

/**
 * Retrieves future pollution data about a particular location up to a four-day forecast.
 * @param {Number} latitude The latitude of a location.
 * @param {Number} longitude The longitude of a location.
 */
async function getFuturePollutionData(latitude, longitude) {
    const data = await fetchJSON(`api/api.php?type=pollution_future&latitude=${latitude}&longitude=${longitude}`);
    const futurePollutionData = document.getElementById("future-pollution-data");

    if (data === null) {
        futurePollutionData.innerHTML = "Error fetching future pollution data.";
        return;
    }

    futurePollutionData.innerHTML = formatPollutionData(data, "dd/MM/yyyy");
}

/**
 * Retrieves historic environmental data based on the inputted dates from the user. The function
 * will render errors to the screen should the user enter invalid dates that cannot be processed
 * by the OpenWeather API.
 */
async function handleHistoricDateSelection() {
    // Prevent the page from actually refreshing to avoid altering the URL and removing the input.
    event.preventDefault();

    // Retrieve the geolocation for the currently-selected project.
    //const [latitude, longitude] = getProjectGeolocation();
    // TODO: remove
    const [latitude, longitude] = ["54.191", "-1.161"];

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

    const currentDatePlusOne = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // Same reasoning as before.
    if (endDate > currentDatePlusOne || startDate > currentDatePlusOne) {
        alert("You cannot enter a date that is in the future.")
        return;
    }

    const data = await fetchJSON(`api/api.php?type=environment_historical&latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}`);

    // Fallback if the error validation doesn't work, so the user is at least made aware something is wrong.
    if (data === null) {
        alert("Bad request. Please change the dates entered.")
        return;
    };

    const [weatherData, pollutionData] = data;
    if (weatherData.list.length == 0 || pollutionData.list.length == 0) {
        alert("Error with the latitude and longitude.") // TODO
        return;
    };

    displayHistoricalData(weatherData, pollutionData);
}

/**
 * Formats the future pollution data up to the date entered by the user. Unfortunately, the 
 * API used does have a way to limit data, so the formatting must be done client (or server) side.
 */
async function handleFuturePollutionSelection() {
    // Prevent the page from actually refreshing to avoid altering the URL and removing the input.
    event.preventDefault();

    // Get the date values from HTML.
    const forecastDateHTML = document.getElementById("future-pollution-date").value;
    const forecastDate = Math.floor(new Date(forecastDateHTML).getTime() / 1000);
    const currentDate = Math.floor(Date.now() / 1000);
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
            // Make the row visible again - this is only useful for rows that were previously hidden.
            row.style.display = "";
        }
    });
}

/**
 * Retrieves the future weather data up to the date entered by the user.
 */
async function handleFutureWeatherSelection() {
    event.preventDefault();

    //const [latitude, longitude] = getProjectGeolocation();
    // TODO: remove
    const [latitude, longitude] = ["54.191", "-1.161"];

    // Get the date values from HTML.
    const forecastDateHTML = document.getElementById("future-weather-date").value;
    const forecastDate = Math.floor(new Date(forecastDateHTML).getTime() / 1000); 
    const currentDate = Math.floor(Date.now() / 1000);
    const differenceInDays = Math.ceil((forecastDate - currentDate) / (60 * 60 * 24));

    if (forecastDate <= currentDate) {
        alert("You cannot enter a date prior to today.");
        return;
        // Limit the number of days to 15 to correspond to the API limit.
    } else if (differenceInDays > 15) {
        alert("You cannot enter a date more than 15 days from now.");
        return;
    };

    // Use the pre-existing weather fetch since it can be generalised to change the days.
    await getFutureWeatherData(latitude, longitude, differenceInDays + 1); // Adds an additional day since the API will only go to the day before.
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

/**
 * Fetches the data associated to a particular API call and formats the response into JSON.
 * 
 * This function performs error handling to catch issues when fetching data, including those
 * networking-related or the response from the API.
 * 
 * @param {string} url The URL to fetch data about, including the parameters needed to form a query.  
 * @returns {Object | null} Returns the response from the API call as an object should there be no
 * errors. Otherwise, a null value will be returned to indicate something went wrong - either
 * network error or an issue with the API.
 */
async function fetchJSON(url) {
    try {
        const response = await fetch(url);

        // If the response isn't "ok", return nothing.
        if (response.status !== 200) {
            return null;
        }

        return response.json();

    } catch (error) {
        return null;
    }
}