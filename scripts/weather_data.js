// Get Variables from the HTML file
const weatherDescription = document.getElementById("weather-description")
const weatherTemp = document.getElementById("weather-temp")
const weatherHumidity = document.getElementById("weather-humidity")
const weatherWind = document.getElementById("weather-wind")

const airQualityIndex = document.getElementById("pollution-air-quality")
const carbonMinoxide = document.getElementById("pollution-carbon-monixide")
const nitrogenMinoxide = document.getElementById("pollution-nitrogen-monoxide")
const nitrogenDioxide = document.getElementById("pollution-nitrogen-dioxide")
const ozone = document.getElementById("pollution-ozone")
const sulphurDioxide = document.getElementById("pollution-sulphur-dioxide")
const ammonia = document.getElementById("pollution-ammonia")

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
    weatherGroup = Math.floor(weatherID / 100);

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

async function getCurrentWeather(latitude, longitude) {
    // TODO: Add try-catch code to deal with erroneous fetches.
    const response = await fetch(`api/api.php?type=weather_current&latitude=${latitude}&longitude=${longitude}`);
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

    // Additional details.
    weatherHumidity.innerText = data.main.humidity;

    return [description, windSpeed, weatherID];
}

function formatAirQuality(airQualityIndex) {
    // Map each index to its corresponding description.
    aqiDictionary = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Poor",
        5: "Very Poor"
    }

    // Get the description of the AQI from the dictionary.
    aqiDescription = aqiDictionary[airQualityIndex];

    // Append the description to the string to return.
    airQualityIndex = `${airQualityIndex} (${aqiDescription})`
    return airQualityIndex
}

async function getCurrentPollutionData(latitude, longitude) {
    const response = await fetch(`api/api.php?type=air_pollution_current&latitude=${latitude}&longitude=${longitude}`);
    const data = await response.json();

    console.log(data);
    // Display the CO2 data into the HTML file.
    airQuality = data.list[0].main.aqi;
    airQualityIndex.innerText = formatAirQuality(airQuality);
    carbonMinoxide.innerText = data.list[0].components.co;
    ammonia.innerText = data.list[0].components.nh3;
    nitrogenMinoxide.innerText = data.list[0].components.no;
    nitrogenDioxide.innerText = data.list[0].components.no2;
    ozone.innerText = data.list[0].components.o3;
    sulphurDioxide.innerText = data.list[0].components.so2;

    // Particulates:
    // carbonMinoxide.innerText = data.list[0].components.pm2_5;
    // carbonMinoxide.innerText = data.list[0].components.pm10;

    // Currently, display the details of the current timestamp statically. In the future, this
    // will have to be made dynamic to avoid hardcoding multiple indexes.
    // TODO    

    return airQuality;
}

function displayHistoricalData(weatherData, pollutionData) {
    // Combine both the weather and pollution data into one by aligning their respective indexes.
    // Both sets of data are ordered by date and time in the same granularity, so the times will match when combining.
    const combinedData = weatherData.list.map((weatherElement, index) => {
        return {
            weather: weatherElement,
            pollution: pollutionData.list[index]
        };
    });

    console.log(combinedData);
    const historicalData = document.getElementById("historical-data");
    // Get every object in the data.list parent object.

    let tableRows = "";
    combinedData.forEach((element) => {
        const weather = element.weather;
        const pollution = element.pollution
        // Convert the date/time from the JSON into a more readable format.
        dateTime = dateFns.format(new Date(weather.dt * 1000), "dd/MM/yyyy HH:mm");
        tableRows += `
            <tr>
                <td>${dateTime}</td>
                <td>${formatWeatherDescription(weather.weather[0].description, weather.weather[0].id)}</td>
                <td>${weather.main.temp}</td>
                <td>${weather.wind.speed}</td>
                <td>${formatAirQuality(pollution.main.aqi)}
            </tr>
        `
    });
    historicalData.innerHTML = tableRows;
}

/**
 * Sets the historical data to 24 hours ago by default.
 */
async function getHistoricalEnvironmentData(latitude, longitude) {
    // Convert current time to a UNIX timestamp.
    const now = Math.floor(Date.now() / 1000);

    const startDate = now - 86400; // 24 hours ago given in seconds (86400).
    const endDate = now;

    const response = await fetch(`api/api.php?type=environment_historical&latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}`);
    const [weatherData, pollutionData] = await response.json();

    console.log(weatherData);
    console.log(`Latitude: ${latitude}; Longitude: ${longitude}`)
    displayHistoricalData(weatherData, pollutionData);
}

async function getFutureEnvironmentData(latitude, longitude) {
    const response = await fetch(`api/api.php?type=weather_future&latitude=${latitude}&longitude=${longitude}&days=4`);
    const weatherData = await response.json();

    console.log(weatherData);

    const futureWeatherData = document.getElementById("future-weather-data");
    // Get every object in the data.list parent object.

    let tableRows = "";
    weatherData.list.forEach((element) => {
        // Convert the date/time from the JSON into a more readable format.
        dateTime = dateFns.format(new Date(element.dt * 1000), "dd/MM/yyyy HH:mm");
        tableRows += `
            <tr>
                <td>${dateTime}</td>
                <td>${formatWeatherDescription(element.weather[0].description, element.weather[0].id)}</td>
                <td>${element.temp.min}</td>
                <td>${element.temp.max}</td>
                <td>${element.speed}</td>
            </tr>
        `
    });

    futureWeatherData.innerHTML = tableRows;
}

// TODO: Fix this function so that it can actually get the current geolocation
async function handleDateSelection() {
    // Prevent the page from actually refreshing to avoid altering the URL and removing the input.
    event.preventDefault();

    // Get the date values from HTML.
    const startHTMLValue = document.getElementById("start-date").value;
    const endHTMLValue = document.getElementById("end-date").value;

    if (!startHTMLValue || !endHTMLValue) {
        alert("Please select two dates from the input boxes.")
        return;
    }

    // Convert the dates to a UNIX timestamp
    const startDate = Math.floor(new Date(startHTMLValue).getTime() / 1000);
    const endDate = Math.floor(new Date(endHTMLValue).getTime() / 1000) + (60 * 60 * 24);   // Needs to add 1 day to ensure all the times past midnight are included.

    // Limit the number of days the user can choose because of the API's restrictions.
    const maxDayRange = 7;
    const differenceInDays = (endDate - startDate) / (60 * 60 * 24) // Convert UNIX (milliseconds) to days before calculating the difference.
    if (differenceInDays > maxDayRange) {
        alert(`You cannot enter dates that are more than ${maxDayRange} days apart.`)
        return;
    }

    currentDatePlusOne = Math.floor(new Date().getTime() / 1000) + (60 * 60 * 24); // Same reasoning as before.
    if (endDate > currentDatePlusOne || startDate > currentDatePlusOne) {
        alert("You cannot enter a date that is in the future.")
        return;
    }

    const response = await fetch(`api/api.php?type=environment_historical&latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}`);
    const [weatherData, pollutionData] = await response.json();

    // Fallback if the error validation doesn't work, so the user is at least made aware something is wrong.
    if (response.status == 400) {
        alert("Bad request. Please change the dates entered.")
        return;
    } else if (weatherData.length == 0 || pollutionData.length == 0) {
        alert("Error with the latitude and longitude.") // TODO
    }

    displayHistoricalData(data);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-date").addEventListener(
        "click",
        handleDateSelection
    )
})


