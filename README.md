<div align="center">
  <h1>
    Construction Project Dashboard
  </h1> 

The __Construction Project Dashboard__ is a cloud-hosted website built using Microsoft Azure services for a fictional construction company. The website was developed to enable key decision-makers to identify which construction projects should proceeed based on current environmental conditions, aiming to minimise carbon emissions and meet internal sustainability goals.

The dashboard presents interactive project information for the user - including site locations, descriptions, required equipment alongside current, historical and forecasted weather and air quality data. Using this information, the system evaluates environmental and safety thresholds to recommend whether construction work for a project should proceed. 
</div>

---
## Background
This project was developed as part of the "Cloud Computing" module undertaken during my last year of university - throughout February to May 2026. The code was last updated on the 25 May 2026 at 3:21PM.

---
## Key Features
1. __Geospatial Project Mapping__ - Project locations are dynamically loaded from the Azure SQL database and plotted as interactive markers. Upon being pressed, the information for a specific project is displayed to the user - showcasing its title, Project Lead, description, equipment required and environmental analytics.
2. __Environmental Analytics__ - For each project, the system tracks real-time, past and forecasted environment metrics. These include:
    * __Weather__: Temperature (°C), wind speed and humidity.
    * __Pollution__: Air Quality Index (AQI) and concentrations of carbon monixide (CO), nitrogen dioxide (NO2), particulates 10mm in diameter (PM10) and particulates 2.5mm in diameter (PM2.5).
3. __Site Recommendations__: Based upon the selected project's required equipment (like a Crane, Digger, Dumper), the system evaluates the current environmental data against safety and pollution thresholds to recommend whether or not work should proceed.
   
---
## Technology Stack
<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
    <th>Role</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>HTML5, CSS3 and Vanilla JavaScript</td>
    <td>User Interface and client-side logic</td>
  </tr>
   <tr>
    <td>Geospatial Mapping</td>
    <td>Leaflet.js</td>
    <td>Geospatial visualisation of the project locations</td>
  </tr>
  <tr>
    <td>Backend</td>
    <td>PHP 8.x</td>
    <td>Handles API routing and secure communication with Azure Services and external APIs</td>
  </tr>
    <tr>
    <td>Database</td>
    <td>Azure SQL</td>
    <td>Persistent storage for project and resource data</td>
  </tr>
    <tr>
    <td>External API: Credentials</td>
    <td>Azure Key Vault</td>
    <td>Secure storage and retrieval of OpenWeatherAPI credentials, avoding presenting the information client-side or in plain text</td>
  </tr>
    <tr>
    <td>External API: Environmental Information</td>
    <td>OpenWeatherAPI</td>
    <td>Source for weather and pollution data</td>
  </tr>
</table>
