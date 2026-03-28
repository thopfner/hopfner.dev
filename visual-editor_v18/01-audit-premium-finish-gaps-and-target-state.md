# Audit: Premium-Finish Gaps And Target State

## What Is Good Already

1. composed-section support truth is now centralized
2. page settings are no longer hidden behind a conditional footer
3. the structure rail is more readable than before
4. the live editor feels materially more premium than the earlier versions

## Remaining Gaps

### 1. Proof quality is still below the product standard

The new v17 test file proves the helper logic, but much of the rest is still source inspection.

That is not enough for:

1. page-workspace footer behavior
2. canvas chrome semantics
3. rail-level global/locked communication

If this editor is going to keep evolving, these surfaces need real interaction and render-state tests.

### 2. Page-workspace footer still feels state-fragmented

The footer is always present now, which is correct.

The remaining issue is hierarchy:

1. dirty state shows primary actions
2. clean state collapses into passive status text only

That keeps the footer persistent technically, but not structurally. The action area still changes shape. A premium workspace should keep the same footer layout in both states.

### 3. Canvas chrome still under-communicates compared with the rail

The rail now says "Global" and shows both world and lock semantics.

The canvas node chrome still reduces global state to a small world icon and uses a separate dirty dot. That is lighter than the old version, but it is now less explicit than the rail. The product should tell one story.

### 4. The next improvement is refinement, not expansion

Do not add new features in this batch.

The correct move is:

1. stronger proof
2. stronger footer consistency
3. stronger semantic consistency
4. cleaner premium polish in the touched surfaces

## Target State

At the end of v18:

1. reviewers trust the completion report because the new behavior is actually tested
2. the page-workspace footer looks like one stable action bar in every state
3. the canvas node chrome communicates key state with the same clarity as the rail
4. the touched UI feels more deliberate, quieter, and more premium
