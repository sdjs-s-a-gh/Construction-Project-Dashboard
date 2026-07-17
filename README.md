<div align="center">
  <h1>
    Construction Company Dashboard
  </h1> 

The __Construction Project Dashboard__ is a cloud-hosted website that was developed as part of the "Cloud Computing" module undertaken during my last year of university. This piece of coursework was developed throughout February to May 2026, with the code last updated on the 25 May 2026 at 3:21PM.  

The website provides a comprehensive project management, environmental monitoring and interactive dashboard tool that aims to help a construction company minimise their carbon emissions. The dashboard enables senior decision-makers to view and interact with each of their client projects, presenting information from project leads and descriptions to, __crucially__, which projects should proceed based on current environmental conditions (weather and air quality).
</div>

---
## Key Features
1. __Geospatial Project Mapping__ - Project locations are dynamically loaded from the Azure SQL database and plotted as interactive markers. Upon being pressed, the information for a specific project is displayed to the user - showcasing their title, Project Lead, description, equipment required and environmental analytics.
2. __Environmental Analytics__ - For each project, the system tracks real-time, past and forecasted environment metrics. These include:
    * __Weather__: Temperature (°C), wind speed and humidity.
    * __Pollution__: Air Quality Index (AQI) and concentrations of carbon monixide (CO), nitrogen dioxide (NO2), particulates 10mm in diameter (PM10) and particulates 2.5mm in diameter (PM2.5).
3. __Site Suggestions__: Based upon the selected project's required equipment (like a Crane, Digger, Dumper), the system evaluates the current environmental data against safety and pollution thresholds to recommend whether or not work should proceed.
   
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
    <td>Handling API routing to fetch API credential as well as environment and database information</td>
  </tr>
    <tr>
    <td>Database</td>
    <td>Azure SQL</td>
    <td>Persistent storage for project and resource data</td>
  </tr>
    <tr>
    <td>External API: Credentials</td>
    <td>Azure Key Vault</td>
    <td>Hiding OpenWeatherAPI credentials from the client and from displaying in plain text</td>
  </tr>
    <tr>
    <td>External API: Environmental Information</td>
    <td>OpenWeatherAPI</td>
    <td>Source for weather and pollution data</td>
  </tr>
</table>
