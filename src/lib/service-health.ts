export type ServiceHealth = "unchecked" | "checking" | "healthy" | "degraded";

/** A reachable 4xx response is not a successful service check. */
export function isSuccessfulHttp(status: number): boolean {
  return status >= 200 && status < 300;
}

export function summarizeHealth(
  checks: readonly { ok: boolean }[] | null,
  running: boolean,
): ServiceHealth {
  if (running) return "checking";
  if (!checks?.length) return "unchecked";
  return checks.every((check) => check.ok) ? "healthy" : "degraded";
}