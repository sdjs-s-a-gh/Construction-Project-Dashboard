addEventListener("DOMContentLoaded", () => {
    const map = initMap();
    const markerGroup = L.layerGroup().addTo(map);
    initTableAndMarkers(map, markerGroup);
});

/**
 * Creates a map.
 * 
 * This function initialises the map variable for the user to interact with and view
 * all construction projects. 
 * @returns {Object} The map object to manipulate and add map markers.
 */
function initMap() {
    // Centre the coordinates roughly in the centre of all projects.
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

/**
 * Creates the table of projects and places markers on the map.
 * 
 * This function calls the database through the backend to retrieve the list of construction
 * projects, before creating a summary table that the user map interact with to view more
 * information. However, any errors when fetching information will result in an error being
 * displayed to the user.
 * 
 * @param {*} map The map object needed to place markers on.
 * @param {*} markerGroup The group a marker should belong to, which could have been used
 * to mass delete markers if this feature was implemented. * 
 */
async function initTableAndMarkers(map, markerGroup) {
    // Get the HTML tag that represents the table so it can be updated.
    const projectsTable = document.getElementById("project-titles");

    // Fetch a small amount of data about a project so it can be displayed in a table for
    // the user to press.
    const response = await fetch(`api/api.php?type=project-list`);

    // Deal with errors potentially caused with the database, such as connection problems or
    // the database not being configured properly.
    if (response.status !== 200) {
        projectsTable.innerHTML = "Error loading the Projects.";
        return;
    }
    const data = await response.json();

    // Populate the table with the information about a project. This code is adapted from that shown in 
    // the Week 8 workshop task 9.
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
            // Retrieve the information from the table rather than re-accessing the 
            // database.
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
 * Extracts the latitude and longitude from a geolocation.
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

/**
 * Places a marker onto the map where a construction project is located.
 *  
 * @param {Object} project A construction project fetched from the database.
 * @param {Object} map The map object to place the marker on.
 * @param {Object} markerGroup The group the forthcoming marker belongs to.
 * @returns {Object} The marker
 */
function createMarker(project, map, markerGroup) {
    const [latitude, longitude] = formatGeolocation(project.geolocation)
    const markerPosition = [latitude, longitude];

    const marker = L.marker(markerPosition, {
        title: project.title
    });

    marker.bindTooltip(project.title);

    // Create a pop-up that gives a brief amount of information about a project.
    const infoWindowContent = `
    <div id=content>
        <h1>${project.title}</h1>
        <p>${project.description}</p>
    </div>    
    `;

    marker.bindPopup(infoWindowContent);

    // Append the marker to the current list, placing it on the map.
    markerGroup.addLayer(marker);

    // Update the surrounding information about a project to reflect this one.
    marker.on("click", function () {
        updateProjectDetails(project.project_id, project.title, latitude, longitude);
    });

    return marker;  // TODO: remove?
}