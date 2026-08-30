---
status: proposed
date: 2026-06-03
decision-makers: Mark Rivera, Amndeep Singh Mann
consulted: Aaron Lippold
---

# User-merge folds a source User into a non-Admin target, target-wins on conflicts

## Context and Problem Statement

Once a User can hold multiple Identities (ADR 0001), an Admin can merge two Users
that are the same person. Merging raises conflicts across global Role, Member
roles on shared nodes, preferences, tokens and sessions, and assignments. How
should those conflicts resolve?

## Decision Drivers

- A merge must not silently strip access the person only reached through one of
  the accounts.
- The result must respect the "an Admin is never a Member" invariant.
- Conflict resolution should be predictable and not depend on an undefined role
  ordering.
- An Admin needs visibility and an override before committing.

## Considered Options

- Most-permissive role wins.
- Target's entire membership set wins, source memberships dropped.
- Explicit admin choice per conflict.
- Target-wins union.

## Decision Outcome

Chosen option: "Target-wins union", because it preserves every boundary the
person could reach while keeping a deterministic default, with an escape hatch
(per-role override in the preview) for the cases an Admin wants to change.

The target (surviving User) must be a non-Admin; the source may be any Role and
its global Role is discarded. Members are unioned, with the target's role winning
on shared-node conflicts. The merge preview lists conflicts and allows per-role
override. Eval and milestone assignments and notifications are reassigned and
de-duped; source tokens are revoked and sessions invalidated; the target wins on
preferences; the source is soft-retired with a `mergedIntoId`; the merge is
audit-logged at `notice`.

### Consequences

- Good, because no boundary access is silently lost; conflicts surface in the
  preview.
- Good, because the outcome is deterministic without needing a defined role
  ordering.
- Bad, because it depends on the Admin-is-not-a-Member invariant, which is
  enforced by separate work (API enforcement and SSO claim re-sync).
- Neutral, because per-role override adds preview UI complexity.

### Confirmation

- Merge rejects an Admin target.
- The source is left soft-retired with `mergedIntoId` set and its tokens and
  sessions invalidated.
- An audit entry at `notice` records source, target, and any overrides.
- The unioned Members match the preview, including overrides.

## Pros and Cons of the Options

### Most-permissive role wins

- Bad, because there is no defined ordering once TIR has custom Member roles, so
  "most permissive" stops being meaningful.

### Target's entire membership set wins, source memberships dropped

- Good, because it is trivial to implement.
- Bad, because it silently strips boundaries the person only reached through the
  source, which defeats the purpose of merging.

### Explicit admin choice per conflict

- Good, because it is maximally precise.
- Bad, because it is impractical at scale; kept only as the per-role override in
  the preview.

### Target-wins union

- Good, because it is a deterministic default plus a per-role override.
- Bad, because it requires building the preview and override UI.

## More Information

Requires the multi-identity model (ADR 0001). Depends on the Admin-is-not-a-Member
invariant holding, enforced by separate work. Acceptance criteria for the
user-merge feature issue derive from this ADR.
