PARAMETERS (IntervalBegin TIMESTAMP, IntervalEnd TIMESTAMP)
SELECT
FolderId,
Path,
EntityId,
CONVERT(IntervalBegin, SQL_TIMESTAMP) AS IntervalBegin,
CONVERT(IntervalEnd, SQL_TIMESTAMP) AS IntervalEnd,
AssayDesignName,
AssayDesignId,
SUM(Uploaded) AS Uploaded,
SUM(Approved) AS Approved,
SUM(Processing) AS Processing
FROM (
	SELECT
	Folder.RowId AS FolderId,
	Folder.Path,
	Folder.EntityId,
	Protocol.Name AS AssayDesignName,
	Protocol.RowId AS AssayDesignId,
	RowId AS RunId,
	CASE WHEN (Runs.Created >= IntervalBegin AND Runs.Created < IntervalEnd) THEN 1 ELSE 0 END AS Uploaded,
	CASE WHEN (approved.Created >= IntervalBegin AND approved.Created < IntervalEnd) THEN 1 ELSE 0 END AS Approved,
	CASE WHEN (processing.Created >= IntervalBegin AND processing.Created < IntervalEnd) THEN 1 ELSE 0 END AS Processing
	FROM Runs
	LEFT JOIN RunGroupMap AS approved ON Runs.RowId = approved.Run AND approved.RunGroup.Name = 'Approved'
	LEFT JOIN RunGroupMap AS processing ON Runs.RowId = processing.Run AND processing.RunGroup.Name = 'Processing'
	WHERE Protocol.RowId IN (SELECT RowId FROM Project.assay.AssayList)
) AS Base
WHERE Uploaded <> 0 OR Approved <> 0 OR Processing <> 0
GROUP BY FolderId, Path, EntityId, AssayDesignName, AssayDesignId