function createPreferencesSpreadsheetTrigger(spreadsheetId: string): void {
  const exists = ScriptApp.getProjectTriggers().some(
    (t) =>
      t.getHandlerFunction() === "onPreferencesSpreadsheetEdit" &&
      t.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      t.getEventType() === ScriptApp.EventType.ON_EDIT &&
      t.getTriggerSourceId() === spreadsheetId
  );
  
  if (!exists) {
    ScriptApp.newTrigger("onPreferencesSpreadsheetEdit")
      .forSpreadsheet(spreadsheetId)
      .onEdit()
      .create();
  }
}
globalThis.createPreferencesSpreadsheetTrigger = createPreferencesSpreadsheetTrigger;

export { }