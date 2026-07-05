export function getApiUrl(): string {
  return process.env.API_URL?.replace(/\/$/, "") ?? "";
}

export function isSplitDeploy(): boolean {
  return Boolean(getApiUrl());
}
