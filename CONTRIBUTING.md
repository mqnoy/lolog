# Contributing to lolog

First of all, thank you for being here. Whether you're fixing a typo, reporting a bug, or proposing a major feature, your help makes `lolog` better for everyone. We know you're busy, and we really appreciate you spending your time on this project.

## How to get involved

### Found a bug?
If something isn't working as expected, please let us know. Before opening a new issue, take a quick peek at the existing ones to see if someone else is already on it. 

When you do open an issue, the more detail the better—steps to reproduce, what you expected to happen, and what actually happened. It helps us help you much faster.

### Have an idea?
We're always looking to make `lolog` more useful. If you have an idea for a feature or an enhancement, open an issue to discuss it. We like to chat about big changes before any code is written so we can make sure they align with the project's goals.

### Submitting a Pull Request
1. **Fork and branch**: Work on a branch off of `main`.
2. **Keep it focused**: Try to keep your PRs relatively small and focused on a single change.
3. **Tests**: If you're adding logic, please add tests. We use Jest, and we like to keep our coverage high.
4. **Commits**: We use [Conventional Commits](https://www.conventionalcommits.org/). It helps us automate our releases and keep a clean history. (e.g., `feat: ...`, `fix: ...`, `docs: ...`).

## Development Setup

We use `pnpm` to keep things fast and efficient.

```bash
pnpm install     # Get everything set up
pnpm run build   # Make sure it compiles
pnpm test       # Run the suite
```

## Our Coding Philosophy

If you're writing code for `lolog`, we have a few "senior-level" preferences that help keep the codebase maintainable:

- **Early Returns over Nesting**: If a condition isn't met, return early. It keeps the "happy path" flat and easy to read.
- **Clarity over Cleverness**: A three-line block that everyone understands is always better than a one-liner that requires a manual to decipher.
- **TypeScript First**: We're a TypeScript project. Try to avoid `any` and lean into strong typing.
- **Document the "Why"**: Comments should explain why we're doing something weird or non-obvious, not just what the code is doing.

If you're ever unsure about an approach, just ask in your PR! We're happy to move through the code together.

---

Thanks again for helping us build a better logging experience for everyone.
