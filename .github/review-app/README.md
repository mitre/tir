# Review app pipeline

This directory supports the pull request review pipeline. It is not a way to deploy TIR. A
chart for real deployments will live elsewhere in the repository.

Every deployment is a slot named after what it deploys. The workflows build an image of the
requested ref, hand it to a self-hosted runner, and run the ref's own end-to-end tests
against the URL the runner reports back. Where and how a slot runs is the runner's business.

## Triggers

| Event                                                  | Result                                               |
| ------------------------------------------------------ | ---------------------------------------------------- |
| PR opened or updated by an author with write access    | deploys `pr-<n>` automatically                       |
| PR by anyone else, while it carries the `deploy` label | deploys `pr-<n>` after approval on `review-external` |
| PR closed                                              | destroys `pr-<n>`                                    |
| nightly `sweep.yml`                                    | destroys slots other than `main` idle for 7 days     |
| `workflow_dispatch`                                    | any ref, PR or named slot, see below                 |

Trust follows the author, not the branch location. The resolve job asks GitHub for the
author's permission on this repository and treats `admin` and `write` (which includes the
maintain role) as trusted, so maintainers working from forks deploy automatically and the
same rule applies unchanged on any repository the workflow is moved to. Dependabot and
outside contributors take the label and approval path.

PR events use `pull_request_target`, so the workflow that reaches the runner is always the
base branch's copy and a PR cannot change what runs there. Each deploy comments the slot URL
on the PR.

The two environments are created with `setup-environments.sh <owner/repo> <reviewer>...`
where a reviewer is a user login or an `org/team-slug`. It needs repository admin. The
`test` job also needs a repository secret `INIT_PASSWORD` matching the slots' seeded admin.

Slot names come from `slot-name.sh`:

| Input                 | Slot              |
| --------------------- | ----------------- |
| `pr=247`              | `pr-247`          |
| `ref=main`            | `main`            |
| `ref=feat/api-tokens` | `feat-api-tokens` |
| `name=demo`           | `demo`            |

```
gh workflow run deploy.yml --ref main -f pr=247
gh workflow run deploy.yml --ref main -f ref=main
gh workflow run destroy.yml --ref main -f name=pr-247
```

## Image

`deploy.yml` builds the image on a GitHub-hosted runner with the `Dockerfile` here and pushes
it to `ghcr.io/<owner>/tir`, tagged by commit and by slot. The runner receives the digest, so
every new build rolls. The Dockerfile replaces the Iron Bank base with `node:22-slim` and
compiles native modules (libxmljs has no Node 22 prebuilt) in a throwaway build stage.

## Runner contract

The deploy, destroy and sweep jobs run on a self-hosted runner labeled `tir-deploy`. The
workflows assume three commands on its PATH and nothing else:

```
deploy-slot <slot> <image> [source]   # creates or updates the slot, prints its URL on stdout
destroy-slot <slot>                   # removes the slot and anything it owns
sweep-slots [max-age-days]            # removes slots other than main idle for that long
```

What a slot is made of, where it runs, how it is isolated and how the runner is hosted all
live with whoever operates the runner, outside this repository. Pointing the pipeline at a
different target means providing those three commands on a runner with that label.
