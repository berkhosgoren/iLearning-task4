SELECT
  c.name AS ColumnName,
  t.name AS DataType,
  c.max_length,
  c.is_nullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('dbo.Users')
ORDER BY c.column_id;