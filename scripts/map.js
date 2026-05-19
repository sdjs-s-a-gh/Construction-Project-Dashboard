function getWeatherData(latitude, longitude) {
    console.log(`lat: ${latitude}, lng: ${longitude}`)
}

function initMap() {
    // Set the coordinates for a certain place
    const centreLatLgn = [54.97874064957384, -1.6100522109054864];

    // Initialise the map and assign it to the div titled "map" programmatically.
    // A zoom of 14x is sufficient to view all projects at first glance.
    const map = L.map("map").setView(centreLatLgn, 14);

    // Ensure the map can actually load the tiles required to make up a single view (a map is based on several images - not just one)
    // Additionally, add the attribution tag to comply with OpenStreetMaps's license.
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    // Add a marker to the map on the centred coordinates.
    const marker = L.marker(centreLatLgn).addTo(map);

    // Add a popup to the marker
    marker.bindTooltip("Northumbria University");

    marker.on("click", function () {
        console.log("Marker was clicked.");
    });

    map.on("move", function () {
        console.log("Centre was moved.");
    });

    // Create some dummy HTML content for a marker
    const content = `
    <div id=content>
    <h1>Northumbria University</h1>
    <p>
        At the Heart of Newcastle City Centre, Northumbria is a vibrant hub of innovation, learning and student life.
        It offers a wide range of modern facilities, cutting-edge research opportunities and a dynamic campus environment. The university
        is known for its strong links to university, providing sudents with valuable real-world experience alongside their studies. WIth a
         a diverse student community and focus on career readiness, it supports learners in developing both academically and professionally.
         Located in one of the UK's most lively student cities, Northumbria combines high-quality education with an exciting social scene,
         making it a popular choice for students from around the world.
    </p>
    `
    // Add a popup to the marker
    marker.bindPopup(content)

    return map
}

function createMarker(pointOfInterest, map, markerGroup) {
    const latlngArray = pointOfInterest.latlng.split(",");

    // Remove the potential whitespaces from the co-ordinates and convert to integers.
    const lat = parseFloat(latlngArray[0].trim());
    const lng = parseFloat(latlngArray[1].trim());
    const markerPosition = [lat, lng];

    // Extract the Name and Description from the table using their <td> tags.
    const poiName = pointOfInterest.name;
    const poiDescription = pointOfInterest.description;

    const marker = L.marker(markerPosition, {
        title: poiName
    });

    marker.bindTooltip(poiName);

    // Format the infoWindowContent for a more aesthetic view.
    const infoWindowContent = `
    <div id=content>
        <h1>${poiName}</h1>
        <p>${poiDescription}</p>
    </div>    
    `;

    marker.bindPopup(infoWindowContent);

    // Append the marker to the current list.
    markerGroup.addLayer(marker);

    return marker;
}

/**
 * Removes all markers present on the map.
 */
function clearAllMarkers(map, markerGroup) {
    markerGroup.clearLayers();
};

async function initTableAndMarkers(map, markerGroup) {
    const pointsOfInterest = document.getElementById("pois");

    const response = await fetch(`api/api.php?type=points_of_interest`);
    const data = await response.json();

    let tableRows = "";
    data.forEach((poi) => {
        // Add the row to the table.
        tableRows += `
            <tr id="${poi.latlng}">
                <td>${poi.name}</td>
                <td>${poi.description}</td>
                <td>${poi.latlng}</td>
            </tr>
        `

        // Autmatically create a map marker from the data.
        createMarker(poi, map, markerGroup);
    });

    pointsOfInterest.innerHTML = tableRows;

    // Add Marker on-click.
    document.querySelectorAll("#pois tr").forEach(row => {
        row.addEventListener("click", function () {
            // Retrieve the data from the table row and format it as an object to mimic the database-returned JSON.
            const poiName = row.children[0].innerText;
            poi = {
                name: poiName,
                description: row.children[1].innerText,
                latlng: row.id
            }

            //createMarker(poi, map, markerGroup);

            // Update the Weather for the selected area.
            const latlngArray = row.id.split(",");

            // Remove the potential whitespaces from the co-ordinates and convert to integers.
            const lat = parseFloat(latlngArray[0].trim());
            const lng = parseFloat(latlngArray[1].trim());

            getCurrentWeather(lat, lng);
            getCurrentPollutionData(lat, lng);
            getHistoricalWeatherData(lat, lng);

            // Update the Current Location
            document.getElementById("current-location").innerHTML = `${poiName}`;
        })
    })
}

addEventListener("DOMContentLoaded", () => {
    const map = initMap();
    const markerGroup = L.layerGroup().addTo(map);
    initTableAndMarkers(map, markerGroup);

    document.getElementById("btn-clear-markers").addEventListener(
        "click", function () {
            clearAllMarkers(map, markerGroup);
        }
    )
});
