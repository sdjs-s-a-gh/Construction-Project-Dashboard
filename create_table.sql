CREATE TABLE tblProjects
(
    project_id INT IDENTITY PRIMARY KEY,
    title NVARCHAR(128) NOT NULL,
    description NVARCHAR(1000) NOT NULL,
    manager NVARCHAR(64) NOT NULL,
    location NVARCHAR(1000) NOT NULL, 
    geolocation NVARCHAR(60) NOT NULL
)

CREATE TABLE tblResources
(
    resource_id INT IDENTITY PRIMARY KEY,
    resource_type NVARCHAR(64) NOT NULL,
    conditions_of_use NVARCHAR(512) NOT NULL
)

CREATE TABLE tblProjectResources
(
    project_id INT,
    resource_id INT,
    PRIMARY KEY (project_id, resource_id),
    FOREIGN KEY (project_id) REFERENCES tblProjects(project_id),
    FOREIGN KEY (resource_id) REFERENCES tblResources(resource_id)
)