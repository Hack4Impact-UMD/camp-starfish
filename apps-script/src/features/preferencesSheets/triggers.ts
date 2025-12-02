function createPreferencesSpreadsheetTrigger(spreadsheetId: string): void {
  const exists = ScriptApp.getProjectTriggers().some(
    (t) =>
      t.getHandlerFunction() === "onEdit" &&
      t.getTriggerSource() === ScriptApp.TriggerSource.SPREADSHEETS &&
      t.getEventType() === ScriptApp.EventType.ON_EDIT &&
      t.getTriggerSourceId() === spreadsheetId
  );
  
  if (!exists) {
    ScriptApp.newTrigger("onEdit")
      .forSpreadsheet(spreadsheetId)
      .onEdit()
      .create();
  }
}
globalThis.createPreferencesSpreadsheetTrigger = createPreferencesSpreadsheetTrigger;

export { }