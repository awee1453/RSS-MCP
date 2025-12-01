# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 3.0.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [YOUR_EMAIL]

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Best Practices

When using RSS-MCP:

1. **Environment Variables**: Keep `.env` file secure and never commit it
2. **Network Security**: Use HTTPS feeds when possible
3. **Database**: Ensure `data/` directory has proper permissions
4. **Updates**: Keep dependencies up to date with `npm run update-deps`
5. **Feed Sources**: Only add feeds from trusted sources
6. **Webhooks**: Validate webhook URLs before adding notifications

## Known Security Considerations

- RSS-MCP validates and sanitizes all feed URLs
- Private IP addresses are blocked to prevent SSRF attacks
- SQL injection is prevented through prepared statements
- Rate limiting is enforced to prevent abuse
- Request timeouts prevent resource exhaustion
