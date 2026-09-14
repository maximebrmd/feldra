# Security policy

## Supported versions

Security fixes target the latest `feldra` release and the `main` branch. Older template releases do not have separate maintenance branches.

Generated projects are independent copies: upgrading the initializer does not patch an existing application. Review fixes to the affected template files and dependencies and apply them to your project. See the [maintenance guide](../docs/maintenance.md).

## Reporting a vulnerability

Do not open a public issue containing exploit details, credentials or private user data.

If GitHub shows **Report a vulnerability** in this repository's Security tab, use that private reporting flow. Otherwise, contact [Maxime Bourmaud on X](https://x.com/maxime_bourmaud) to arrange a private disclosure channel. If direct messages are unavailable, send a brief contact request without sensitive details.

Include the affected version or commit, the database/auth combination, a minimal reproduction, the potential impact and any suggested mitigation. Use synthetic data and redact all secrets. Maintainers will coordinate reproduction, a fix and disclosure with the reporter; no guaranteed response timeline is offered.
