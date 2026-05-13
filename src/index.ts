export type NumericUnitIssueCode =
  | "empty"
  | "invalid-type"
  | "invalid-syntax"
  | "non-finite"
  | "negative-not-allowed"
  | "unit-required"
  | "unit-not-allowed"
  | "percent-not-allowed";

export interface NumericUnitIssue {
  code: NumericUnitIssueCode;
  message: string;
  input: unknown;
}

export interface NumericUnit {
  amount: number;
  unit: string;
  raw: string;
}

export interface ParseNumericUnitOptions {
  allowedUnits?: readonly string[];
  requireUnit?: boolean;
  allowUnitlessZero?: boolean;
  allowNegative?: boolean;
  allowPercent?: boolean;
  trim?: boolean;
}

export type ParseNumericUnitResult =
  | { ok: true; value: NumericUnit; issues: [] }
  | { ok: false; value: null; issues: NumericUnitIssue[] };

export interface FormatNumericUnitOptions {
  unitlessZero?: boolean;
  maximumFractionDigits?: number;
}

const NUMERIC_UNIT_PATTERN =
  /^([+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?)(?:\s*([^\s\d.+-][^\s]*))?$/;

export function parseNumericUnit(
  input: unknown,
  options: ParseNumericUnitOptions = {}
): ParseNumericUnitResult {
  const {
    allowedUnits,
    requireUnit = false,
    allowUnitlessZero = true,
    allowNegative = true,
    allowPercent = true,
    trim = true
  } = options;

  if (typeof input !== "string" && typeof input !== "number") {
    return fail("invalid-type", "Expected a string or number input.", input);
  }

  const raw = String(input);
  const candidate = trim ? raw.trim() : raw;

  if (candidate.length === 0) {
    return fail("empty", "Expected a numeric value with an optional unit.", input);
  }

  const match = NUMERIC_UNIT_PATTERN.exec(candidate);
  if (!match) {
    return fail("invalid-syntax", "Expected a finite number followed by an optional unit.", input);
  }

  const amountText = match[1];
  const amount = Number(amountText);
  const unit = match[2] ?? "";

  if (!Number.isFinite(amount)) {
    return fail("non-finite", "Expected a finite numeric value.", input);
  }

  if (!allowNegative && amount < 0) {
    return fail("negative-not-allowed", "Negative values are not allowed.", input);
  }

  if (!allowPercent && unit === "%") {
    return fail("percent-not-allowed", "Percent units are not allowed.", input);
  }

  const canUseUnitlessZero = allowUnitlessZero && Object.is(amount, 0);
  if (requireUnit && unit === "" && !canUseUnitlessZero) {
    return fail("unit-required", "A unit is required for this value.", input);
  }

  if (allowedUnits && unit !== "" && !allowedUnits.includes(unit)) {
    return fail("unit-not-allowed", `Unit "${unit}" is not in the allowed unit list.`, input);
  }

  return {
    ok: true,
    value: {
      amount,
      unit,
      raw: candidate
    },
    issues: []
  };
}

export function isNumericUnit(input: unknown, options: ParseNumericUnitOptions = {}): boolean {
  return parseNumericUnit(input, options).ok;
}

export function formatNumericUnit(
  value: Pick<NumericUnit, "amount" | "unit">,
  options: FormatNumericUnitOptions = {}
): string {
  const { unitlessZero = true, maximumFractionDigits } = options;
  const amount =
    maximumFractionDigits === undefined
      ? String(value.amount)
      : value.amount.toLocaleString("en-US", {
          maximumFractionDigits,
          useGrouping: false
        });

  if (unitlessZero && Object.is(value.amount, 0)) {
    return "0";
  }

  return `${amount}${value.unit}`;
}

function fail(code: NumericUnitIssueCode, message: string, input: unknown): ParseNumericUnitResult {
  return {
    ok: false,
    value: null,
    issues: [
      {
        code,
        message,
        input
      }
    ]
  };
}
