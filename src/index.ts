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
  normalizedInput?: string;
  unit?: string;
}

export interface NumericUnit {
  amount: number;
  unit: string;
  raw: string;
  normalized: string;
}

export interface ParseNumericUnitOptions {
  allowedUnits?: readonly string[];
  caseSensitiveUnits?: boolean;
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
  separator?: string;
}

export interface NumericUnitParser {
  parse(input: unknown, options?: ParseNumericUnitOptions): ParseNumericUnitResult;
  isValid(input: unknown, options?: ParseNumericUnitOptions): boolean;
  format(value: Pick<NumericUnit, "amount" | "unit">, options?: FormatNumericUnitOptions): string;
}

const NUMERIC_UNIT_PATTERN =
  /^([+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?)(?:\s*([^\s\d.+-][^\s]*))?$/;

export function parseNumericUnit(
  input: unknown,
  options: ParseNumericUnitOptions = {}
): ParseNumericUnitResult {
  const {
    allowedUnits,
    caseSensitiveUnits = true,
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
    return fail("empty", "Expected a numeric value with an optional unit.", input, candidate);
  }

  const match = NUMERIC_UNIT_PATTERN.exec(candidate);
  if (!match) {
    return fail("invalid-syntax", "Expected a finite number followed by an optional unit.", input, candidate);
  }

  const amountText = match[1];
  const amount = Number(amountText);
  const unit = match[2] ?? "";

  if (!Number.isFinite(amount)) {
    return fail("non-finite", "Expected a finite numeric value.", input, candidate);
  }

  if (!allowNegative && amount < 0) {
    return fail("negative-not-allowed", "Negative values are not allowed.", input, candidate);
  }

  if (!allowPercent && unit === "%") {
    return fail("percent-not-allowed", "Percent units are not allowed.", input, candidate, unit);
  }

  const canUseUnitlessZero = allowUnitlessZero && Object.is(amount, 0);
  if (requireUnit && unit === "" && !canUseUnitlessZero) {
    return fail("unit-required", "A unit is required for this value.", input, candidate);
  }

  if (allowedUnits && unit !== "" && !includesUnit(allowedUnits, unit, caseSensitiveUnits)) {
    return fail("unit-not-allowed", `Unit "${unit}" is not in the allowed unit list.`, input, candidate, unit);
  }

  const value = {
    amount,
    unit,
    raw: candidate,
    normalized: formatNumericUnit({ amount, unit }, { unitlessZero: unit === "" })
  };

  return {
    ok: true,
    value,
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
  const { unitlessZero = true, maximumFractionDigits, separator = "" } = options;
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

  return value.unit === "" ? amount : `${amount}${separator}${value.unit}`;
}

export function createNumericUnitParser(defaultOptions: ParseNumericUnitOptions = {}): NumericUnitParser {
  return {
    parse(input, options) {
      return parseNumericUnit(input, mergeOptions(defaultOptions, options));
    },
    isValid(input, options) {
      return isNumericUnit(input, mergeOptions(defaultOptions, options));
    },
    format(value, options) {
      return formatNumericUnit(value, options);
    }
  };
}

function includesUnit(allowedUnits: readonly string[], unit: string, caseSensitive: boolean): boolean {
  if (caseSensitive) {
    return allowedUnits.includes(unit);
  }

  const lowerUnit = unit.toLowerCase();
  return allowedUnits.some((allowedUnit) => allowedUnit.toLowerCase() === lowerUnit);
}

function mergeOptions(
  defaultOptions: ParseNumericUnitOptions,
  options: ParseNumericUnitOptions | undefined
): ParseNumericUnitOptions {
  return options === undefined ? { ...defaultOptions } : { ...defaultOptions, ...options };
}

function fail(
  code: NumericUnitIssueCode,
  message: string,
  input: unknown,
  normalizedInput?: string,
  unit?: string
): ParseNumericUnitResult {
  const issue: NumericUnitIssue = {
    code,
    message,
    input
  };

  if (normalizedInput !== undefined) {
    issue.normalizedInput = normalizedInput;
  }

  if (unit !== undefined) {
    issue.unit = unit;
  }

  return {
    ok: false,
    value: null,
    issues: [issue]
  };
}
