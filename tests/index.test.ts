import { describe, expect, it } from "vitest";
import { formatNumericUnit, isNumericUnit, parseNumericUnit } from "../src/index.js";

describe("parseNumericUnit", () => {
  it("parses a number and arbitrary unit", () => {
    const result = parseNumericUnit("  50 gold  ");

    expect(result).toEqual({
      ok: true,
      value: {
        amount: 50,
        unit: "gold",
        raw: "50 gold"
      },
      issues: []
    });
  });

  it("parses compact units and signed decimals", () => {
    expect(parseNumericUnit("-1.5rem")).toMatchObject({
      ok: true,
      value: { amount: -1.5, unit: "rem" }
    });
  });

  it("parses percent and unitless zero", () => {
    expect(parseNumericUnit("100%")).toMatchObject({
      ok: true,
      value: { amount: 100, unit: "%" }
    });
    expect(parseNumericUnit(0, { requireUnit: true })).toMatchObject({
      ok: true,
      value: { amount: 0, unit: "" }
    });
  });

  it("rejects empty and invalid syntax", () => {
    expect(parseNumericUnit("")).toMatchObject({
      ok: false,
      issues: [{ code: "empty" }]
    });
    expect(parseNumericUnit("calc(100% - 1rem)")).toMatchObject({
      ok: false,
      issues: [{ code: "invalid-syntax" }]
    });
  });

  it("enforces required units and allowed units", () => {
    expect(parseNumericUnit("12", { requireUnit: true })).toMatchObject({
      ok: false,
      issues: [{ code: "unit-required" }]
    });
    expect(parseNumericUnit("12bananas", { allowedUnits: ["px", "rem"] })).toMatchObject({
      ok: false,
      issues: [{ code: "unit-not-allowed" }]
    });
  });

  it("can reject negatives and percent units", () => {
    expect(parseNumericUnit("-2px", { allowNegative: false })).toMatchObject({
      ok: false,
      issues: [{ code: "negative-not-allowed" }]
    });
    expect(parseNumericUnit("50%", { allowPercent: false })).toMatchObject({
      ok: false,
      issues: [{ code: "percent-not-allowed" }]
    });
  });

  it("supports decimals and exponent notation", () => {
    expect(parseNumericUnit(".5em")).toMatchObject({
      ok: true,
      value: { amount: 0.5, unit: "em" }
    });
    expect(parseNumericUnit("1e2px")).toMatchObject({
      ok: true,
      value: { amount: 100, unit: "px" }
    });
  });
});

describe("formatNumericUnit", () => {
  it("formats compact values", () => {
    expect(formatNumericUnit({ amount: 1.25, unit: "rem" })).toBe("1.25rem");
    expect(formatNumericUnit({ amount: 0, unit: "px" })).toBe("0");
    expect(formatNumericUnit({ amount: 0, unit: "px" }, { unitlessZero: false })).toBe("0px");
  });

  it("rounds when requested", () => {
    expect(formatNumericUnit({ amount: 1.2345, unit: "px" }, { maximumFractionDigits: 2 })).toBe(
      "1.23px"
    );
  });
});

describe("isNumericUnit", () => {
  it("returns a boolean", () => {
    expect(isNumericUnit("12 px")).toBe(true);
    expect(isNumericUnit("url(x)")).toBe(false);
  });
});
