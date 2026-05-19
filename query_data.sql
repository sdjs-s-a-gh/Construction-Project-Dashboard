SELECT project_id, title, geolocation
FROM tblProjects

SELECT tblProjects.project_id, tblProjects.description, tblProjects.manager,
tblProjects.location, tblResources.resource_type
FROM tblProjects, tblResources, tblProjectResources
WHERE tblProjects.project_id = tblProjectResources.project_id AND
tblResources.resource_id = tblProjectResources.resource_id

#### More Efficient Search on ALL Attributes I need ####
SELECT tblProjects.project_id, tblProjects.description, tblProjects.manager,
tblProjects.location, tblResources.resource_type
FROM tblProjects
INNER JOIN tblProjectResources ON tblProjects.project_id = tblProjectResources.project_id
INNER JOIN tblResources ON tblResources.resource_id = tblProjectResources.resource_id

#### Same query but with a searchable project_id ####
SELECT tblProjects.project_id, tblProjects.description, tblProjects.manager,
tblProjects.location, tblResources.resource_type 
FROM tblProjects
INNER JOIN tblProjectResources ON tblProjects.project_id = tblProjectResources.project_id
INNER JOIN tblResources ON tblResources.resource_id = tblProjectResources.resource_id
WHERE tblProjects.project_id = 1