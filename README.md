# numeric-unit-parse-kit

Small TypeScript library for parsing generic numeric values with units, such as `12px`, `50 gold`, `-1.5turn`, `100%`, or `0`, into structured values with diagnostics.

It is browser-friendly, dependency-free, and deliberately narrower than a full expression parser.

## Install

```bash
npm install numeric-unit-parse-kit
```

## Usage

```ts
import { parseNumericUnit, formatNumericUnit } from "numeric-unit-parse-kit";

const parsed = parseNumericUnit("  50 gold  ", {
  allowedUnits: ["gold", "silver"],
  requireUnit: true
});

if (parsed.ok) {
  parsed.value.amount; // 50
  parsed.value.unit; // "gold"
  formatNumericUnit(parsed.value); // "50gold"
} else {
  parsed.issues;
}
```

## API

### `parseNumericUnit(input, options?)`

Returns a discriminated result:

```ts
type ParseNumericUnitResult =
  | { ok: true; value: NumericUnit; issues: [] }
  | { ok: false; value: null; issues: NumericUnitIssue[] };
```

Options:

- `allowedUnits`: restrict accepted units.
- `requireUnit`: reject unitless values except zero when `allowUnitlessZero` is enabled.
- `allowUnitlessZero`: allow `0` even when `requireUnit` is true. Defaults to `true`.
- `allowNegative`: allow negative numeric values. Defaults to `true`.
- `allowPercent`: allow `%` as a unit. Defaults to `true`.
- `trim`: trim surrounding whitespace before parsing. Defaults to `true`.

### `formatNumericUnit(value, options?)`

Formats a parsed value back to a compact string. By default, unitless zero is serialized as `0`.

### `isNumericUnit(input, options?)`

Boolean convenience wrapper around `parseNumericUnit`.

## What this is not

This package does not parse formulas, ranges, dimensions with multiple units, colors, or full CSS grammar. Use a domain parser when you need a complete language parser.

## License

MPL-2.0
