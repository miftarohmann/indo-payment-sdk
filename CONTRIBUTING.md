# Contributing to Indo Payment SDK

We love contributions! Here's how to get started.

---

## Development Setup

```bash
# Clone repository
git clone https://github.com/miftarohman/indo-payment-sdk.git
cd indo-payment-sdk

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test
```

---

## Project Structure

```
indo-payment-sdk/
├── packages/
│   ├── core/           # Core types, errors, base provider
│   └── midtrans/       # Midtrans provider implementation
├── examples/
│   └── basic/          # Basic usage example
├── tests/              # Unit & integration tests
└── docs/               # Documentation & screenshots
```

---

## Making Changes

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make** your changes
4. **Add tests** for new features
5. **Ensure** all tests pass
   ```bash
   pnpm test
   ```
6. **Build** to check for TypeScript errors
   ```bash
   pnpm build
   ```
7. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
8. **Push** to your fork
   ```bash
   git push origin feature/amazing-feature
   ```
9. **Open** a Pull Request

---

## Code Style

- **TypeScript** - All code must be written in TypeScript
- **Formatting** - Run `pnpm format` before committing
- **Linting** - Run `pnpm lint` to check for issues
- **Conventions** - Follow existing code patterns
- **Documentation** - Add JSDoc comments for public APIs

### Example JSDoc

```typescript
/**
 * Create a new payment invoice
 * @param params - Invoice creation parameters
 * @returns Promise resolving to the created invoice
 * @throws {APIError} When the API request fails
 */
async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
  // ...
}
```

---

## Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm test -- tests/midtrans.test.ts
```

### Integration Tests

```bash
# Test with real Midtrans Sandbox API
# Requires .env file with MIDTRANS_SERVER_KEY
pnpm test:real
```

### Test Guidelines

- Add unit tests for new features
- Test edge cases and error handling
- Use mocks for external API calls in unit tests
- Test with real API in sandbox mode for integration tests
- Ensure all existing tests pass before submitting PR

---

## Adding a New Provider

1. Create a new package in `packages/`:
   ```
   packages/
   └── your-provider/
       ├── src/
       │   ├── index.ts
       │   ├── provider.ts
       │   └── types.ts
       ├── package.json
       └── tsconfig.json
   ```

2. Extend `BasePaymentProvider` from `@indo-payment/core`

3. Implement required methods:
   - `createInvoice()`
   - `getStatus()`
   - `verifyWebhook()`
   - `parseWebhook()`

4. Add tests in `tests/your-provider.test.ts`

5. Update README with new provider info

---

## Commit Messages

Use clear, descriptive commit messages:

```
# Good examples
Add Xendit provider with invoice support
Fix webhook signature verification for Midtrans
Update README with new examples
Remove deprecated payment methods

# Bad examples
fix stuff
update
wip
```

### Format

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:** `Add`, `Fix`, `Update`, `Remove`, `Refactor`, `Docs`, `Test`

---

## Pull Request Guidelines

- **Title**: Clear description of changes
- **Description**: Explain what and why
- **Tests**: Include tests for new features
- **Documentation**: Update docs if needed
- **Size**: Keep PRs focused and small

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing done

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

---

## Questions?

- **Issues**: Open an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers directly

---

## License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

**Thank you for contributing! 🙏**
