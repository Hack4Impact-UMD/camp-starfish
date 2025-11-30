function setScriptProperty<T>(key: string, value: T) {
  PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(value));
}
globalThis.setScriptProperty = setScriptProperty;

function getScriptProperty<T>(key: string): T | null {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  return value ? JSON.parse(value) : null;
}
globalThis.getScriptProperty = getScriptProperty;

export {};