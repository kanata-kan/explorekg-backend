# Contributing Guidelines

## Getting Started

Thank you for contributing to the Explore Kyrgyzstan server project! This document provides guidelines for contributing to the codebase.

## Development Workflow

### 1. Branch Naming Convention

Use descriptive branch names with the following format:

```
<type>/<short-description>
```

**Types:**

- `feature/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `test/` - Test additions/fixes
- `refactor/` - Code refactoring

**Examples:**

- `feature/user-authentication`
- `fix/database-connection-retry`
- `chore/update-dependencies`
- `docs/api-documentation`

### 2. Commit Message Format

We follow the Conventional Commits specification for consistent commit messages.

**Format:**

```
<scope>(<module>): <short description>

[optional body]

[optional footer]
```

**Scopes:**

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance
- `refactor` - Code refactoring
- `style` - Code style changes

**Modules:**

- `api` - API endpoints
- `auth` - Authentication
- `db` - Database related
- `config` - Configuration
- `middleware` - Middleware
- `utils` - Utilities
- `types` - TypeScript types

**Examples:**

```bash
feat(api): add user registration endpoint
fix(db): improve connection retry logic
docs(api): update authentication documentation
test(auth): add unit tests for login validation
chore(deps): update mongoose to v8.0.0
refactor(middleware): simplify error handler
```

**Rules:**

- Keep the summary line under 72 characters
- Use present tense ("add" not "added")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Don't capitalize the first letter of the summary
- Don't end the summary with a period

### 3. Pull Request Process

1. **Create a new branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**

   ```bash
   git add .
   git commit -m "feat(api): add new feature"
   ```

3. **Push your branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request:**
   - Use a descriptive title
   - Fill out the PR template
   - Reference any related issues
   - Add appropriate labels

### 4. Code Quality Standards

Before submitting a PR, ensure your code meets these standards:

#### Run Tests

```bash
pnpm test                 # Run all tests
pnpm test:coverage       # Check test coverage
```

#### Code Linting

```bash
pnpm lint               # Check for linting errors
pnpm lint:fix           # Fix auto-fixable issues
```

#### Code Formatting

```bash
pnpm format             # Format code
pnpm format:check       # Check formatting
```

#### Type Checking

```bash
pnpm type-check         # Verify TypeScript types
```

### 5. Code Style Guidelines

#### TypeScript

- Use TypeScript strict mode
- Define proper types for all functions and variables
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

#### File Structure

- Keep files focused on a single responsibility
- Use barrel exports in index.ts files
- Group related functionality in folders

#### Comments

- Write comments in English only
- Use JSDoc for function documentation
- Explain complex business logic
- Don't comment obvious code

#### Error Handling

- Use custom error classes from `utils/AppError.ts`
- Provide meaningful error messages
- Log errors appropriately

### 6. Testing Guidelines

#### Test Structure

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Group related tests in describe blocks

#### Test Types

- **Unit Tests**: Test individual functions/classes
- **Integration Tests**: Test API endpoints
- **Mock external dependencies**: Database, APIs, etc.

#### Test Examples

```typescript
describe('User Authentication', () => {
  describe('login', () => {
    it('should return token for valid credentials', async () => {
      // Test implementation
    });

    it('should throw error for invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

### 7. Environment Setup

#### Required Tools

- Node.js v18+
- pnpm package manager
- MongoDB (local or cloud)
- Git

#### Development Environment

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development server
pnpm dev

# Run tests
pnpm test
```

### 8. Documentation

#### API Documentation

- Document all new endpoints in `docs/API.md`
- Include request/response examples
- Document error scenarios
- Update version information

#### Code Documentation

- Update relevant documentation for changes
- Keep README files current
- Document configuration changes

### 9. Review Process

#### Before Requesting Review

- [ ] All tests pass
- [ ] Code is formatted and linted
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] PR description is complete

#### Review Criteria

- Code quality and maintainability
- Test coverage and quality
- Documentation completeness
- Performance implications
- Security considerations

### 10. Release Process

#### Version Numbering

We follow Semantic Versioning (SemVer):

- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backwards compatible)
- Patch: Bug fixes (backwards compatible)

#### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number updated
- [ ] Changelog updated
- [ ] Tagged release created

## Questions or Issues?

If you have questions about contributing:

1. Check existing documentation
2. Search existing issues
3. Create a new issue with the `question` label
4. Contact the maintainers

Thank you for contributing to Explore Kyrgyzstan!
