##### tblProjects ####
INSERT INTO dbo.tblProjects (title, description, manager, location, geolocation)
VALUES ('NESST', 
    'A new university building with lab spaces, meeting rooms, breakout areas, kitchen areas and WC facilities.',
    'Chelsea Dawson',
    'Northumbria University, Ellison Terrace, Newcastle upon Tyne, NE1 8ST',
    '54.976414676146824, -1.6066366875533187'
)

INSERT INTO dbo.tblProjects (title, description, manager, location, geolocation)
VALUES ('CHASE', 
    'A new university building with lab spaces, meeting rooms, breakout areas, kitchen areas and WC facilities.',
    'Peter Duncan',
    'Northumbria University, Ellison Terrace, Newcastle upon Tyne, NE1 8ST',
    '54.97919158255862, -1.6064863942439456'
)

INSERT INTO dbo.tblProjects (title, description, manager, location, geolocation)
VALUES ('HMRC', 
    'An office space for a public sector client to include gym space, staff rooms with kitchen areas, toilet facilities, meeting rooms and breakout areas.',
    'Dan Smith',
    'New Bridge Street, Newcastle upon Tyne, NE1 2SW',
    '54.97419179801806, -1.6113036886189427'
)

INSERT INTO dbo.tblProjects (title, description, manager, location, geolocation)
VALUES ('St James Park', 
    'An extension to the existing football stadium to include a clubhouse for coaching non-professional players and hosting events. To include a small field, an exhibition room, toilet facilities and a kitchen.',
    'Chelsea Dawson',
    'Newcastle United Football Co Ltd, St. James Park, Strawberry Place, Newcastle upon Tyne, NE1 4ST',
    '54.97470900180268, -1.6204767255123336'
)

##### tblResources ####
INSERT INTO dbo.tblResources (resource_type, conditions_of_use)
VALUES ('Crane', 
    'Do not use in high wind',
)

INSERT INTO dbo.tblResources (resource_type, conditions_of_use)
VALUES ('Drill', 
    'Do not use in heavy rain',
)

INSERT INTO dbo.tblResources (resource_type, conditions_of_use)
VALUES ('Dumper Truck', 
    'Do not use in heavy rain. Has CO2 emissions so don''t use if air quality CO, PM10, PM2.5 or NO2 readings are moderate are poorer.',
)

INSERT INTO dbo.tblResources (resource_type, conditions_of_use)
VALUES ('Digger', 
    'Do not use in heavy rain. Has CO2 emissions so don''t use if air quality CO, PM10, PM2.5 or NO2 readings are moderate are poorer.',
)

INSERT INTO dbo.tblResources (resource_type, conditions_of_use)
VALUES ('Loader', 
    'Do not use in heavy rain. Has CO2 emissions so don''t use if air quality CO, PM10, PM2.5 or NO2 readings are moderate are poorer.',
)

INSERT INTO dbo.tblResources (resource_type, conditions_of_use)
VALUES ('Concrete mixer', 
    'Do not use in heavy rain',
)

#### tblProjectResources ####
INSERT INTO dbo.tblProjectResources (project_id, resource_id)
VALUES ('1', 
    '1'
)

INSERT INTO dbo.tblProjectResources (project_id, resource_id)
VALUES ('1', 
    '2'
)

INSERT INTO dbo.tblProjectResources (project_id, resource_id)
VALUES ('1', 
    '3'
)

INSERT INTO dbo.tblProjectResources (project_id, resource_id)
VALUES ('1', 
    '4'
)

INSERT INTO dbo.tblProjectResources (project_id, resource_id)
VALUES ('1', 
    '5'
)

INSERT INTO dbo.tblProjectResources (project_id, resource_id)
VALUES ('2', 
    '1'
)

INSERT INTO dbo.tblProjectResources (project_id, resource_id)
VALUES ('2', 
    '1'
)