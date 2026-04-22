# AGENTS.md

Landlord Buddy | Repo Operating Instructions for Codex and Contributors

## 1\. Product frame

Landlord Buddy is a paid workflow-support product for self-managing Victorian residential landlords.

It is not:

* a law firm
* a substitute for legal advice in complex matters
* an official filing system
* a portal clone
* a generic property management suite

The first MVP wedge is arrears-to-notice-readiness. The first job of the product is to reduce costly procedural failure caused by confusion, bad sequencing, missing evidence, and false confidence.

The current product shape includes a focused operating shell above the hero arrears workflow.

This shell is bounded and does not change legal or trust posture. It must support preparation quality, evidence traceability, and handoff readiness without becoming a generic property-management suite.

## 2\. Non-negotiable product truths

Always preserve these:

* Preparation is separate from official action.
* Handoff is separate from execution.
* Deterministic rules are separate from guarded logic.
* Local validation is separate from official acceptance.
* Public-guidance mirroring is separate from authenticated official flows.
* Warnings are behavioural controls, not decorative copy.
* "Ready" must never quietly mean filed, lodged, accepted, legally sufficient, or officially complete.

Never imply:

* filing
* submission
* proxy filing
* official equivalence
* legal path selection
* guaranteed compliance
* stronger validity than the engine truth
* stronger finality than the system truth

## 3\. Current project phase

The project is operating with Phase 4B as the primary build phase and bounded Phase 4C product-experience construction in parallel.

Do not pretend guarded blocker doctrine is settled just because some implementation scaffolds now exist.

## 4\. Source-of-truth precedence

If instructions conflict, use this order:

1. the explicit task packet for the current task
2. the most recent accepted Product / Build spec, handover pack, or freeze map
3. the most recent accepted canon / doctrine summary
4. this `AGENTS.md`
5. older repo docs, examples, and superseded notes

If a conflict affects semantics, legal/trust posture, or consequential UI behaviour, stop and report it instead of choosing silently.

## 5\. Core architectural posture

You must preserve:

* one-capture spine
* output mode separation
* official handoff model
* trust/source-surface placement
* deterministic vs guarded tagging
* warning / slowdown / referral / hard-stop separation
* no portal mimicry
* no legal-advice behaviour
* no claim of live official system parity

## 6\. Repo structure expectations

Preferred structure:

* `/src` for source
* `/tests` for tests
* `/docs/architecture` for architecture docs
* `/docs/specs` for specs
* `/docs/qa` for QA docs
* `/docs/decisions` for ADR-style decisions when needed

Do not scatter speculative docs or ad hoc helper files around the repo.

## 7\. Codex operating rules

### 7.1 Work style

* Keep diffs small.
* Work phase-scoped.
* Do the minimum clean implementation that satisfies the task.
* Do not refactor unrelated code.
* Do not delete user material unless the task clearly requires it.
* Prefer additive changes over broad rewrites unless the task explicitly calls for replacement.

### 7.2 Verification

Before reporting completion, run:

* `npm run verify`

If PowerShell blocks `npm.ps1`, run:

* `npm.cmd run verify`

If verification cannot be run, say so explicitly and explain why. Do not bluff. Do not claim tests passed unless they were actually run.

### 7.3 Completion report format

Every completion report should include:

* Task ID
* Objective completed: yes / no
* Summary of what changed
* Files created
* Files modified
* Files intentionally untouched
* Tests / checks run
* `npm run verify` result
* Guarded assumptions preserved
* Out-of-scope checks
* Review hotspots
* Recommended next task
* Risks / follow-ups
* Touched user-facing surfaces

### 7.4 Next-task recommendations

You may suggest a next task, but:

* treat it as a recommendation, not a decision
* do not outrank Product sequencing
* do not assume your recommendation will be accepted
* do not broaden scope just because a seam is visible

## 8\. Stop-and-escalate rule

Stop and report instead of implementing if the task requires:

* choosing between competing legal or doctrinal interpretations
* inventing final wording for consequential trust/copy surfaces
* deciding whether a guarded state should become deterministic
* renaming or collapsing accepted state families, warning families, or CTA hierarchy
* creating official-looking behaviour where the current posture is prep-and-handoff
* expanding the focused operating shell beyond accepted bounded inclusions/exclusions
* wording shell reminders, bond visibility, or export behaviour in ways that imply compliance certification, legal sufficiency, or official acceptance

## 9\. Deterministic vs guarded implementation rule

Only encode deterministic behaviour where the accepted product/legal posture is clearly settled.

Where doctrine or workflow remains unsettled:

* do not hard-code it as truth
* represent it as one of:

  * warning
  * slowdown
  * review
  * referral
  * placeholder hook
  * insertion point
  * config/registry slot

Never collapse guarded ambiguity into hard rules.

## 10\. State and semantics rules

### 10.1 Trust-cue-bound states

A state that requires a trust cue must not appear on a consequential surface without that cue unless there is a documented reason it is still safe.

### 10.2 Frozen state handling

Treat these as current posture.

Provisionally frozen:

* Blocked
* Needs review
* Ready to review
* Continue in official system
* Preparation only
* Live confirmation required
* Stale

Frozen now:

* Referral-first
* On hold

Conditionally frozen:

* Guarded
* Ready for handoff
* External review recommended

### 10.3 Ready-language rule

Use `Prepared for handoff` as the safer general user-facing default unless the full handoff panel is present.

"Ready" must never stand alone on a consequential surface.

### 10.4 Semantic stability rule

Do not rename frozen state families, warning families, trust keys, CTA tiers, handoff semantics, or renderer-state labels unless the task explicitly authorises it.

Any change to protected lines, CTA hierarchy, trust-cue binding, or warning consequences is a review event, not normal copy iteration

## 11\. Renderer and presentation rules

Presentation layers must consume explicit semantic/renderer state.

Do not derive consequential UI meaning from raw readiness, timeline, or partial data flags.

Do not collapse blocked / guarded / external / referral / stale states into generic pending, success, or “all good” presentation.

Timeline is a visibility and control surface, not a doctrine source.

## 12\. Copy-ready facts rule

Only expose consequential user-facing copy from facts and states that are explicitly safe for presentation.

Do not promote advisory, stale, inferred, or guarded internal structures into user-facing certainty.

Do not let generic timing copy outrank hearing-specific instructions or official overrides.

## 13\. CTA and handoff rules

Follow the accepted CTA hierarchy:

* ordinary handoff uses Tier 1 external CTA
* stale/live-confirmation-required states shift CTA accordingly
* wrong-channel uses stop + explain + reroute
* referral-first must not use ordinary handoff CTA as primary

Handoff must always remain visibly external.

Never create CTAs that imply:

* submit
* file
* lodge
* complete official action inside the product

## 14\. Warning-family rules

Warnings are not just copy. They define behaviour.

Accepted first-pass warning families:

* service warnings
* evidence timing warnings
* handoff warnings
* referral / sensitive overlay warnings

Each warning family must preserve:

* meaning
* must-not-imply boundary
* required trust cue
* default action type
* escalation rule
* fallback stronger state

Do not invent warning semantics ad hoc.

## 15\. BR02-specific implementation rules

Preserve:

* one service-event row per renter per service event / attempt
* consent proof as a standalone reusable object per renter / scope variation
* registered post as the preferred deterministic path
* email requires stored consent proof
* hand service remains guarded / review-led
* evidence timing is dual-step plus override, not one magic countdown
* generic timing copy must not outrank hearing-specific instructions
* the 7-day step is a required prep step, not a fake universal deadline
* upload does not equal evidence readiness or official acceptance

## 16\. BR04-specific implementation rules

Preserve:

* class-based retention
* deletion and de-identification as separate lifecycle actions
* scoped preservation override / hold model
* policy/config-driven timing by class
* no one-size-fits-all retention
* no universal hard-coded timers
* no blanket global hold
* no blanket unlogged delete
* rental applications remain out of beta scope unless fully compliant

## 17\. BR03-specific implementation rules

Preserve:

* touchpoint registry as config/control asset
* mirror stable public guidance only
* authenticated actions remain handoff-only
* stale-state downgrade is a real control mechanism, not cosmetic UX
* portal family and notice origin matter
* wrong-channel reroute is a real stop/reroute pattern
* most touchpoint changes update registry/logs, not canon

## 18\. BR01-specific implementation rules

Preserve:

* objective-first routing
* possession vs money/remedy separation
* one matter may require multiple route branches
* do not flatten mixed matters into one arrears conveyor belt
* unresolved-objective stall is valid
* split handling must remain explicit
* guarded insertion points must remain guarded

## 19\. Docs rule

If a task changes behaviour, state semantics, registry meaning, or user-facing trust/handoff posture, update the relevant docs in the same change set unless the task explicitly forbids documentation edits.

Docs must:

* reflect current canon and accepted product posture
* identify blocked vs non-blocked assumptions
* avoid superseded doctrine
* stay understandable to a new contributor

Do not:

* restate superseded doctrine as current
* hide guarded ambiguity
* mix product truth with speculative future ideas

## 20\. Tests rule

Prefer meaningful tests over broad shallow test sprawl.

Good tests prove:

* invariant behaviour
* deterministic vs guarded separation
* implication-sensitive behaviour
* registry/config posture
* state / CTA / trust-cue alignment where implemented

## 21\. What to do when uncertain

If something appears unsettled:

1. check the task packet
2. check the most recent accepted Product / Build spec, handover pack, or freeze map
3. prefer conservative implementation
4. preserve insertion points
5. report the guarded assumption explicitly

Do not “finish the thought” by inventing doctrine.

## 22\. What not to do

Do not:

* invent unsettled legal thresholds
* add portal submission logic
* add rental application structures
* flatten warning/slowdown/referral into one generic success path
* convert stale/advisory material into deadline truth
* imply product execution of official actions
* treat upload as finality
* treat recorded proof as legal sufficiency
* use broad “smart” automation that silently crosses legal/trust boundaries

## 23\. Preferred prompt contract for Product → Codex

Good Codex prompts include:

* one-sentence goal
* phase
* why this change is needed
* affected files/modules to inspect first
* hard constraints
* deliverables
* acceptance criteria
* required verification
* completion report format

## 24\. Focused operating shell wording and review-event rules

### 24.1 Shell positioning rule

Always describe the product as:

* hero arrears-to-notice-readiness wedge first
* focused operating shell second
* prep-and-handoff bounded throughout

Never describe the shell as a full property-management suite.

### 24.2 Accepted shell inclusion fence

The shell may include bounded record, reminder, note, and export supports that feed preparation quality and handoff readiness.

Use `docs/specs/focused-operating-shell-baseline.md` as the accepted inclusion/exclusion source.

Do not invent additional shell capabilities without an accepted decision artifact.

### 24.3 Shell exclusion fence

Do not imply or introduce:

* accounting integrations or full accounting suite behaviour
* tax advice or tax optimisation
* direct official filing/submission
* tenant messaging platform behaviour
* maintenance marketplace behaviour
* generic PM-suite expansion

### 24.4 Reminder, bond, and export wording constraints

Always preserve:

* reminders are prompts and controls, not compliance clearance
* bond-paid status is factual visibility only, not legal sufficiency
* export is structured packaging only, not filing, acceptance, or legal readiness

### 24.5 Review-event trigger

Treat any change to shell scope framing, reminder implication, bond-status implication, export implication, or hero-wedge precedence as a review event, not ordinary copy iteration.

## 25\. Final principle

This repo should behave like a careful cockpit:

* calm
* bounded
* auditable
* explicit about uncertainty
* useful without pretending to be a lawyer or a portal

