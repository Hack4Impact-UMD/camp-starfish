
//onEdit() method that runs automatically when a user changes the value of any cell in a spreadsheet
/**
 * The event handler triggered when editing the spreadsheet.
 * @param {Event} e The onEdit event.
 * @see https://developers.google.com/apps-script/guides/triggers#onedite
 */
function onEdit(e: Event) {
  // set a comment on the edited cell to indicate when it was changed to help with potential tracking
  const range = (e as any).range as GoogleAppsScript.Spreadsheet.Range;
  range.setNote('Last modified: ' + new Date());

  //setting boolean flags based on bundle or jamboree 
 const sheetName = range.getSheet().getName().toLowerCase();
 let section = '';
  const value = String(range.getValue()).toLowerCase();
  if (sheetName.indexOf('bundle') !== -1 || value === 'bundle'){
    section = 'bundle';
  } 
  if (sheetName.indexOf('jamboree') !== -1 || value === 'jamboree') {
    section = 'jamboree';
  }
  else{
    section = 'null'
  }
  if (section === 'null'){ 
    return;
  }

  //accessing document properties to set the flag
  const props = PropertiesService.getDocumentProperties();
  const key = 'PREF_CHANGED' + section.toUpperCase();
  //if this value is null there are no avaiable document properties
  if (props === null){
    throw new Error('Document properties are not available.');
  }
  //setting the property to true if it is not already true (that is has been changed)
  if (props.getProperty(key) !== 'true') {
    props.setProperty(key, 'true');
  }
}

//returning the preference change flags as an object
function getPreferenceChangeFlags() {
  const props = PropertiesService.getDocumentProperties();
  return {
    bundle: props.getProperty('PREF_CHANGED_BUNDLE') === 'true',
    jamboree: props.getProperty('PREF_CHANGED_JAMBOREE') === 'true',
  };
}


function getPreferenceChangeFlagsWrapper() {
  return JSON.stringify(getPreferenceChangeFlags());
}