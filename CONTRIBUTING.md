# Contributing

Thanks for taking the time to improve this package.

## Local setup

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Pull requests

Please keep changes focused and include tests for behavior changes. Small API improvements are welcome when they keep numeric-unit parsing predictable, typed, and easy to use in both Node and browser-oriented tooling.

Before opening a pull request, run:

```bash
npm run typecheck
npm test
npm run build
```

## Issues

When reporting a bug, include:

- the package version;
- the input that failed;
- the options used;
- the expected diagnostic or parsed value;
- the actual diagnostic code or parsed value.

This package parses one numeric value and one unit. Please keep feature requests focused on diagnostics, formatting and validation policies rather than full CSS parsing, formula parsing or unit conversion.
