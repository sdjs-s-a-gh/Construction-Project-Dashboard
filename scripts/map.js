addEventListener("DOMContentLoaded", () => {
    const map = initMap();
    const markerGroup = L.layerGroup().addTo(map);
    initTableAndMarkers(map, markerGroup);
});

function initMap() {
    // Centre the coordinates around the middle of each project.
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

async function initTableAndMarkers(map, markerGroup) {
    // Get the HTML tag that represents the table so it can be updated.
    const projectsTable = document.getElementById("project-titles");

    // Fetch a small amount of data about a project so it can be displayed in a table for
    // the user to press.
    const response = await fetch(`api/api.php?type=project-list`);

    if (response.status !== 200) {
        projectsTable.innerHTML = "Error loading the Projects."
    }
    const data = await response.json();

    let tableRows = "";
    data.forEach((project) => {
        const [latitude, longitude] = formatGeolocation(project.geolocation);
        
        tableRows += `
            <tr 
                id="${project.project_id}"
                data-latitude="${latitude}"
                data-longitude="${longitude}"
            >
                <td>${project.title}</td>
            </tr>
        `
        // Automatically create a map marker from the data.
        createMarker(project, map, markerGroup);
    });

    // Update the table with the new rows generated.
    projectsTable.innerHTML = tableRows;

    // Retrieve more information about a project on-click.
    document.querySelectorAll("#project-titles tr").forEach(row => {
        row.addEventListener("click", function () {
            const projectID = row.id;
            const projectTitle = row.children[0].innerHTML;
            const latitude = row.dataset.latitude;
            const longitude = row.dataset.longitude;   

            updateProjectDetails(projectID, projectTitle, latitude, longitude);

            // Zoom into the map marker only when the table row is clicked.
            map.setView([latitude, longitude], 17);
        })
    })
};

/**
 * Returns an array that represents the latitude and longitude of a given
 * geolocation string.
 * 
 * @param {string} geolocation The co-ordinates of a project given as a string and
 * delimeted by a comma.  
 */
function formatGeolocation(geolocation) {
    // The following geolocation code is adapted from the Week 10, Part 2 workshop.
    const geolocationArray = geolocation.split(",");

    // Remove the potential whitespaces from the co-ordinates and convert to integers.
    const lat = parseFloat(geolocationArray[0].trim());
    const lng = parseFloat(geolocationArray[1].trim());

    return [lat, lng]
}

function createMarker(project, map, markerGroup) {
    const [latitude, longitude] = formatGeolocation(project.geolocation)
    const markerPosition = [latitude, longitude];

    const marker = L.marker(markerPosition, {
        title: project.title
    });

    marker.bindTooltip(project.title);

    // TODO: Add more information to this pop-up
    // Format the infoWindowContent for a more aesthetic view.
    const infoWindowContent = `
    <div id=content>
        <h1>${project.title}</h1>
    </div>    
    `;

    marker.bindPopup(infoWindowContent);

    // Append the marker to the current list.
    markerGroup.addLayer(marker);

    marker.on("click", function () {
        updateProjectDetails(project.project_id, project.title, latitude, longitude);
    });

    return marker;
}