# End-to-end tests

Playwright smoke tests that run against a live TIR instance. They never start the
server themselves and never assume anything beyond a freshly seeded database.

Both seeded accounts are used, because Admin and User permissions are mutually exclusive
in TIR (separation of duties): `admin@tir.local` administers, `user@tir.local` is the one
who can be a boundary member. The fixtures `adminPage` and `userPage` sign in as each, in
separate browser contexts. Both accounts carry the instance's `INIT_PASSWORD`.

| Variable        | Default                 | Meaning                         |
| --------------- | ----------------------- | ------------------------------- |
| `BASE_URL`      | `http://localhost:3000` | Instance under test             |
| `INIT_PASSWORD` | from `.env`             | Password of the seeded accounts |

The config loads the repository `.env` when present, so a local run against the dev server
needs nothing set. A variable already in the environment wins over the file.

```bash
npx playwright install --with-deps chromium   # once per machine
npm run dev                                   # in another shell, or point BASE_URL elsewhere
npm run test:e2e
npx playwright show-report tests/e2e/playwright-report
```

Every run writes an HTML report to `tests/e2e/playwright-report` with a screenshot of each
test's final state. Failed tests also get an error context under `tests/e2e/test-results`.
Traces are off and the login helper clears the password field right after submitting, so a
failed login never records the password in the report, which CI publishes as an artifact.
Tests must create whatever data they need: a review slot keeps its database between
redeploys, so nothing may depend on another test's leftovers.
