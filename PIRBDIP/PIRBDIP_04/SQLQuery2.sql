select * from masha;
select * from geometry_columns;

SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE DATA_TYPE IN ('geometry', 'point', 'linestring', 'polygon', 'multipoint', 'multilinestring', 'multipolygon', 'geometrycollection');

SELECT srid FROM dbo.geometry_columns

SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dbo' AND DATA_TYPE != 'geometry'

SELECT geom.STAsText() AS WKT_Description
FROM masha;

SELECT obj1.geom.STIntersection(obj2.geom) AS Intersection
FROM masha obj1, masha obj2
WHERE obj1.id = 30 AND obj2.id = 31;
;
SELECT geom.STPointN(1).ToString() AS Coordinates
FROM masha
WHERE id = 30;

SELECT id, userlabel, 
CASE 
WHEN geom.STIsValid() = 1 THEN geom.STArea() 
ELSE NULL 
END AS Area
FROM masha;

DECLARE @point geometry = geometry::STGeomFromText('POINT(30 40)', 4326);
SELECT @point AS Point

DECLARE @line geometry = geometry::STGeomFromText('LINESTRING(20 30, 25 35, 30 40)', 4326);
SELECT @line AS Line;

DECLARE @polygon geometry = geometry::STGeomFromText('POLYGON((20 30, 40 30, 40 50, 20 50, 20 30))', 4326);
SELECT @polygon AS Polygon;


DECLARE @point GEOMETRY = GEOMETRY::STGeomFromText('POINT(30 40)', 4326);
DECLARE @polygon GEOMETRY = GEOMETRY::STGeomFromText('POLYGON((20 30, 40 30, 40 50, 20 50, 20 30))', 4326);
SELECT @polygon.STContains(@point) AS PointInsidePolygon;

DECLARE @line GEOMETRY = GEOMETRY::STGeomFromText('LINESTRING(20 30, 25 35, 30 40)', 4326);
DECLARE @polygonn GEOMETRY = GEOMETRY::STGeomFromText('POLYGON((20 30, 40 30, 40 50, 20 50, 20 30))', 0);
SELECT @line.STIntersects(@polygonn) AS LineIntersectsPolygon;

IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_masha_geom')
DROP INDEX IX_masha_geom ON masha;

CREATE SPATIAL INDEX IX_masha_geom
ON masha(geom)
WITH (BOUNDING_BOX = (0, 0, 100, 100)); 

SET STATISTICS PROFILE ON;
SELECT * FROM masha 
WHERE geom.STIntersects(geometry::STGeomFromText('POINT(37.6178 55.7558)', 4326)) = 1;
SET STATISTICS PROFILE OFF;


CREATE OR ALTER PROCEDURE FindContainingObject
@longitude FLOAT,
@latitude FLOAT
AS
BEGIN
DECLARE @point geometry = geometry::STGeomFromText('POINT(' + 
CAST(@longitude AS VARCHAR(20)) + ' ' + 
CAST(@latitude AS VARCHAR(20)) + ')', 4326);
    
SELECT id,userlabel AS object_name,geom.STGeometryType() AS geometry_type,geom.STAsText() AS geometry_wkt FROM masha
WHERE geom.STIntersects(@point) = 1;
END;
GO

EXEC FindContainingObject 25.9739, 5.1425;
EXEC FindContainingObject 25.974016, 5.142657;
EXEC FindContainingObject 25.0, 5.0;




