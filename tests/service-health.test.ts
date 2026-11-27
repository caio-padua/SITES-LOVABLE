import { expect, test } from "bun:test";
import { isSuccessfulHttp, summarizeHealth } from "../src/lib/service-health";

test("unauthorized catalog responses cannot certify database health", () => {
  expect(isSuccessfulHttp(401)).toBe(false);
  expect(isSuccessfulHttp(200)).toBe(true);
  expect(isSuccessfulHttp(503)).toBe(false);
});

test("no completed checks means health is not verified", () => {
  expect(summarizeHealth(null, false)).toBe("unchecked");
  expect(summarizeHealth([], false)).toBe("unchecked");
});

test("one failed check prevents an all-services-healthy summary", () => {
  expect(summarizeHealth([{ ok: true }, { ok: false }], false)).toBe("degraded");
  expect(summarizeHealth([{ ok: true }], false)).toBe("healthy");
});

test("in-progress checks must not certify health", () => {
  expect(summarizeHealth([{ ok: true }], true)).toBe("checking");
});