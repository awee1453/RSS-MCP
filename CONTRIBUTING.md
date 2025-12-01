# Contributing to RSS-MCP

First off, thank you for considering contributing to RSS-MCP! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When reporting a bug, include:**
- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior
- Actual behavior
- Your environment (OS, Node.js version, etc.)
- Screenshots if applicable

### Suggesting Features

We love feature suggestions! Please:
- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this feature would be useful
- Provide examples if possible

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes** following our code style
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Commit with a clear message** describing what you've done
6. **Push to your fork** and submit a pull request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/RSS-MCP.git
cd RSS-MCP

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (if available)
npm test
```

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Use Zod for input/output validation
- Follow the repository pattern for database operations

### Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests liberally

**Examples:**
- `feat: Add sentiment analysis tool`
- `fix: Resolve OPML parsing error`
- `docs: Update README with new tools`
- `refactor: Optimize database queries`

### Tool Development Guidelines

When adding new MCP tools:

1. Create tool file in `src/tools/rss-[toolname].ts`
2. Define Zod schemas for input/output
3. Implement handler function
4. Add service layer if needed in `src/services/`
5. Register tool in `src/index.ts`
6. Update README and documentation
7. Add usage examples

### Testing

- Ensure the server starts without errors
- Test your tool with MCP Inspector
- Verify database operations work correctly
- Check error handling for edge cases

## Questions?

Feel free to open an issue with the "question" label!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
