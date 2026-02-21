# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-21

### ⚠️ BREAKING CHANGES

- **Core Engine**: Switched underlying logging engine to **Pino** for superior performance.
- **API Surface**: Refactored `LoggerService` constructor and configuration options.
- **Decorators**: Updated `@Logger` decorator to support modern TypeScript metadata.
- **Redaction**: Redaction is now configurable via `LoggerConfig`.

### Added

- **Multi-Transport Support**: Added native support for Console and File transports using Pino targets.
- **Modern Tooling**: Switched to SWC for faster builds and testing.
- **TypeScript Support**: Full type definitions (`.d.ts`) included in the package.
- **Unit Tests**: comprehensive test suite following AAA patterns.
- **Examples**: Added real-world usage and log agent integration examples.
- **Configurable Redaction**: Custom paths and censor strings can now be defined in `LoggerConfig`.

### Changed

- Updated package namespace to `@mqnoy/lolog`.
- Streamlined `ILolog` interface for better consistency with industry standards.
- Improved development experience with `pino-pretty` integration.

## [0.0.7] - (Legacy)

- Initial versions with basic logging capabilities.
