import { OIDCAuthProvider } from "./oidcAuthProvider";

let currentProvider: OIDCAuthProvider | null = null;
let currentSettings: Record<string, any> = {};

export function getAuthProvider() {
  return currentProvider;
}

export async function configureAuthProvider(settings: Record<string, any>) {
  const provider = new OIDCAuthProvider(settings);
  await provider.init();
  currentProvider = provider;
  currentSettings = settings;
}

export function getAuthSettings() {
  return currentSettings;
}
