const jsonData = [
    {
        "name": "Newcastle Civic Centre built 1958-1968. ",
        "description": `Conceived as a departure from the form and idea of a
            traditional town hall, being intended to embody a less hierarchical structure.No
            dominating facade or grand entrance but has a number of entrances from
            different sides, planned to encourage democracy, embracing the people of
            Newcastle and also designed to include facilities that the general public could
            hire for non council functions.A marriage of art and architecture, council leader,
            T Dan Smith installed a considerable quantity of contemporary art.The River God
            Tyne is a bronze sculpture of a bearded river god that stands on the south wall of
            Newcastle Civic Centre.The sculpture was created by David Wynne and
            commissioned for the civic centre's opening in 1968.`,
        "lat": "54.978734171600465",
        "lng": "-1.6108656662635386"
    },
    { 
        "name": "Northumberland Street", 
        "description": `A major shopping street in the city, home to a wide range of 
            different retailers, banks and cafes. In terms of rental per square foot, 
            Northumberland Street is the most expensive location in the UK outside London to 
            own a shop.`, 
        "lat": "54.97542081386029", 
        "lng": "-1.6125115556986522" 
    }, 
    { 
        "name": "Grey's Monument", 
        "description": `A grade I listed monument to Charles Grey, 2nd Earl Grey built in 
            1838 stands at the head of Grey Street. Lord Grey standing atop a 130-foot-high (40 
            m) column designed by local architects John and Benjamin Green. Sculptor Edward 
            Hodges Baily (creator of Nelson'''s statue in Trafalgar Square. The Lord's head was 
            knocked o during second world war by bolt of lightening 1941. In 1947, a new head 
            based on the preserved fragments of the original.`, 
        "lat": "54.973835431345336", 
        "lng": "-1.6131686389043856" 
    }
]

function populateCityInfo(map) {
    // Create generalised HTML content to hold map marker details.
    jsonData.forEach((element) => {
        const content = `
            <div id=content>
                <h1>${element.name}</h1>
                <p>${element.description}</p>        
            </div>
        `;  

        console.log(element.name);

        // Convert the latitude/longitude to floats since Leaflet doesn't accept strings.
        const markerPosition = [parseFloat(element.lat), parseFloat(element.lng)];

        const marker = L.marker(markerPosition).addTo(map);

        // Set the tooltip/title of the popup to give additional context to the user.
        marker.bindTooltip(jsonData.name);

        // Attach the popup information.
        marker.bindPopup(content);

        // Create a "click" listen event.
        marker.on("click", function () {
            // Update the data on screen to correspond to the marker clicked.
            //getWeatherData(jsonData.lat, jsonData.lng);
            getCurrentWeather(element.lat, element.lng);
            getCurrentPollutionData(element.lat, element.lng);
            getHistoricalWeatherData(element.lat, element.lng);
        });

    })
        
}

function getWeatherData(latitude, longitude) {
    console.log(`lat: ${latitude}, lng: ${longitude}`)
}

function initMap() {
    // Set the coordinates for a certain place
    const centreLatLgn = [54.97874064957384, -1.6100522109054864];

    // Initialise the map and assign it to the div titled "map" programmatically,
    // with a zoom of 14x
    const map = L.map("map").setView(centreLatLgn, 16)

    // Ensure the map can actually load the tiles required to make up a single view (a map is based on several images - not just one)
    // Additionally, add the attribution tag to comply with OpenStreetMaps's license.
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

    // Add a marker to the map on the centred coordinates.
    const marker = L.marker(centreLatLgn).addTo(map)

    // Add a popup to the marker
    //marker.bindPopup("Newcastle-upon-Tyne City Centre")

    marker.bindTooltip("Northumbria University")

    marker.on("click", function () {
        console.log("Marker was clicked.")
    });
    map.on("move", function() {
        console.log("Centre was moved.")
    })

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

    populateCityInfo(map);
}

addEventListener("DOMContentLoaded", () => {
    initMap();
})
