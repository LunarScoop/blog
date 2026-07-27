# Contributing

Thanks for contributing to `ulBo`.

Use Node.js 24.15.0 or newer and pnpm 11.9.0. The repository includes `.node-version` and `.nvmrc` files.

## Workflow

1. Fork the repository and create a branch from `main`.
2. Keep changes focused and small.
3. Run local checks before opening a PR:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

4. Open a pull request with:
- clear scope
- screenshots for UI changes
- testing notes

## Commit Convention

Use concise commit messages, for example:

- `feat: add xxx`
- `fix: handle xxx`
- `docs: update xxx`
- `chore: clean xxx`

## Coding Notes

- Keep user-facing config inside `src/config/`.
- Preserve zero-content behavior (`public/` and `src/content/blog/` may be empty).
- Do not re-introduce hard dependency on static files under `public/`.

## Questions

Use GitHub Discussions/Issues for questions and proposals.
