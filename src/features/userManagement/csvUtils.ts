// Returns a csv-parse `columns` callback that rejects the file up front when
// required header columns are missing.
export function requireCsvColumns(requiredColumns: string[]) {
  return (cols: string[]) => {
    const missingColumns = requiredColumns.filter(col => !cols.includes(col));
    if (missingColumns.length > 0) {
      throw Error("Missing columns: " + missingColumns.join(", "));
    }
    return cols;
  };
}
