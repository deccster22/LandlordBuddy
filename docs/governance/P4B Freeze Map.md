\# Lane 2 Freeze Map
\#\# Phase 4B

This document records the current freeze status for Lane 2 surface semantics, warning families, CTA controls, and screen-pattern references.

It exists to stop:
\- semantic drift
\- duplicate drafting
\- implication bugs
\- “I thought that was settled” confusion

\#\# Freeze status legend

\#\#\# Frozen
Safe to use as the current operating rule or baseline unless a specific revisit trigger fires.

\#\#\# Provisionally frozen
Stable enough to build against now, but still subject to later tightening once first rendered surfaces are reviewed.

\#\#\# Conditionally frozen
Accepted only with explicit usage constraints. Unsafe if used outside those conditions.

\#\#\# Accepted working tool
Not itself product truth copy, but accepted as the canonical process/tool for producing and reviewing truth.

\#\#\# Open / follow-on
Useful and accepted directionally, but not yet frozen as final operating truth.

\---

\# 1\. Canonical working tools

\#\# 1.1 Surface Inventory Template v0.2
\*\*Status:\*\* Accepted working tool
\*\*Role:\*\* Canonical Phase 4B surface-inventory tool

Use this to map, for each screen:
\- state truth
\- must-not-imply boundary
\- required trust cue
\- CTA tier / action type
\- warning-family mapping
\- implication / trust / comprehension risks

\*\*Locked strengthening field:\*\*
“Can this state appear without its required trust cue on this screen?”

\#\# 1.2 One-page reviewer sheet
\*\*Status:\*\* Accepted working tool
\*\*Role:\*\* Fast semantic review gate before a surface is treated as safe

Covers:
\- state truth
\- trust cue
\- CTA
\- boundary
\- warning-family
\- finality
\- freshness

\*\*Quick fail conditions include:\*\*
\- implies legal path selection
\- implies filing/submission
\- implies official equivalence
\- implies stronger validity than engine truth
\- lets “ready” stand alone on a consequential surface
\- lets a trust-cue-bound state appear without its required cue
\- uses ordinary handoff language on referral-first surfaces

\#\# 1.3 Warning-family worksheet, populated first pass
\*\*Status:\*\* Accepted working baseline
\*\*Role:\*\* Operational worksheet for warning meaning, escalation, and fallback stronger states

\#\# 1.4 Warning-Family Discipline Pass v0.1
\*\*Status:\*\* Accepted semantic control layer
\*\*Role:\*\* First-pass semantic fence for warning families

\*\*Locked ownership split:\*\*
\- Legal defines meaning, implication boundary, trust cue, escalation
\- Product maps triggers, screens, and behaviour
\- Marketing tunes tone after semantics are fixed

\---

\# 2\. Expression and boundary system

\#\# 2.1 Beta Copy Surface Pack v1.2
\*\*Status:\*\* Provisionally frozen expression baseline

\*\*Locked baseline elements:\*\*
\- Hero promise: \`Prepare your Notice to Vacate\`
\- Support/output label: \`Notice Readiness Pack\` remains secondary only
\- Official handoff stays external
\- Freshness cues stay local, dated, and non-magical
\- Boundary lines stay short, visible, and repeated at reliance moments

\#\# 2.2 Handoff CTA Hierarchy v1.0
\*\*Status:\*\* Frozen

\*\*Locked posture:\*\*
\- ordinary handoff uses Tier 1 external CTA
\- stale/live-confirmation-required states shift CTA accordingly
\- wrong-channel uses stop \+ explain \+ reroute
\- referral-first must not use ordinary handoff CTA as primary

\#\# 2.3 Anti-Overclaim Ruleset v1.0
\*\*Status:\*\* Frozen

Must not imply:
\- filing
\- submission
\- proxy filing
\- official equivalence
\- stronger validity than engine truth
\- legal path selection
\- stronger finality than system truth

\#\# 2.4 Boundary-Line Library by Surface v0.2
\*\*Status:\*\* Frozen

Boundary lines must be:
\- short
\- visible
\- close to reliance moments
\- surface-specific
\- not buried in a footer

\---

\# 3\. State family freeze map

\#\# 3.1 Provisionally frozen states

\#\#\# Blocked
Meaning: A clear rule or missing required element prevents the step.
Must not imply: optional friction only.
Required trust cue: the blocking rule must be named.

\#\#\# Needs review
Meaning: The step may still be possible, but proof/service/timing/context is too uncertain to auto-pass.
Must not imply: soft approval or near-readiness.
Required trust cue: the uncertainty type must be named.

\#\#\# Ready to review
Meaning: The step has been prepared far enough for user review.
Must not imply: filed, accepted, valid in all circumstances, or officially complete.
Required trust cue: “Ready in Landlord Buddy…” clarifier on consequential surfaces.

\#\#\# Continue in official system
Meaning: Product role ends here; live action happens externally.
Must not imply: optional handoff or proxy filing.
Required trust cue: visible handoff language plus external CTA hierarchy.

\#\#\# Preparation only
Meaning: Draft/prep support only.
Must not imply: portal parity, submission parity, or official acceptance.
Required trust cue: freshness/date stamp where public guidance is involved.

\#\#\# Live confirmation required
Meaning: Product cannot safely confirm the next step without checking live official instruction.
Must not imply: generic product guidance still controls.
Required trust cue: what live source may override.

\#\#\# Stale
Meaning: Touchpoint no longer fresh enough for confident reliance.
Must not imply: minor inconvenience only.
Required trust cue: last-checked date plus downgrade consequence.

\*\*Special rule:\*\* on deadline, route, and readiness surfaces, stale should force prep-only or hard-stop behaviour.

\#\# 3.2 Frozen now

\#\#\# Referral-first
Meaning: Not a normal workflow branch; ordinary progression stops and the user is directed to specialist or official help.
Must not imply: ordinary handoff or “continue carefully.”
Required trust cue: concrete reason for referral.
Primary CTA posture: stop-and-refer only.

\#\#\# On hold
Meaning: Some records are under scoped preservation and ordinary deletion may not apply yet.
Must not imply: permanent retention, blanket hold, or whole-account freeze.
Required trust cue: hold is scoped and reviewable; on consequential surfaces, scope/reason must be visible or expandable.

\#\# 3.3 Conditionally frozen

\#\#\# Guarded
Meaning: Matter may still be workable, but route/path is not straightforward.
Must not imply: normal workflow friction, near-readiness, or settled path.
Usage constraint: generally avoid as broad public-facing default; use mainly as in-product caution state with concrete ambiguity explanation.

\#\#\# Ready for handoff
Meaning: Preparation is complete enough for the user to continue externally.
Must not imply: filed, lodged, accepted, submitted, or officially complete.
Usage constraint: use only when the full handoff panel is present. Otherwise prefer \`Prepared for handoff\`.

\#\#\# External review recommended
Meaning: Human or official review is strongly advisable before reliance.
Must not imply: casual suggestion only or ordinary progression by default.
Usage constraint: paused progression by default; if treated as optional in safety-sensitive contexts, escalate to \`Referral-first\`.

\---

\# 4\. Warning family freeze map

\#\# 4.1 Service warning family
\*\*Status:\*\* Frozen first-pass semantic fence

Meaning: Service method and proof affect readiness and reliance risk; service is a hierarchy, not a flat menu.

Must not imply:
\- all methods equally safe
\- email fine by default
\- hand delivery proven once recorded
\- recorded proof \= legal sufficiency

Default actions:
\- hard stop for missing deterministic proof gaps
\- slowdown/review for guarded hand-service proof
\- referral escalation if service disputes or stacked defects become materially consequential

\#\# 4.2 Evidence timing warning family
\*\*Status:\*\* Frozen first-pass semantic fence

Meaning: Evidence timing is dual-step and override-sensitive.

Must not imply:
\- one flat universal deadline
\- upload alone \= readiness
\- generic timeline always controls

Default actions:
\- warning \+ slowdown where generic model may still apply
\- hearing notice / official instruction controls when known
\- hard stop when controlling override is known and missed

\#\# 4.3 Handoff warning family
\*\*Status:\*\* Frozen first-pass semantic fence

Meaning: Product role ends at preparation/review/handoff; official action still happens externally.

Must not imply:
\- filing
\- submission
\- proxy filing
\- official acceptance
\- optional handoff where official action is still required

Default actions:
\- normal handoff on ordinary end-of-flow surfaces
\- reroute when official channel is wrong
\- hard-stop current path if system knows current channel is wrong

\#\# 4.4 Referral / sensitive overlay family
\*\*Status:\*\* Frozen first-pass semantic fence

Subtypes:
\- Guarded ambiguity
\- External review recommended
\- Referral-first

Each subtype must define:
\- meaning
\- must-not-imply boundary
\- required trust cue
\- default action type
\- escalation rule
\- fallback stronger state

\---

\# 5\. Screen pattern library

\#\# 5.1 Gold-standard worked examples
The following are accepted as strong reference patterns:
\- Threshold Check
\- Notice Preparation
\- Output Review
\- Official Handoff

\#\# 5.2 Additional first-wave reference entries
Also completed:
\- Homepage
\- Waitlist / beta invite
\- Onboarding / first run
\- Pricing / upgrade
\- FAQ
\- Stale
\- Live confirmation required
\- Privacy / help
\- Deletion request / hold-affected
\- Guarded mixed-claim ambiguity
\- Referral-first sensitive overlay
\- Wrong-channel reroute

\*\*Rule:\*\* Product should extend these patterns, not invent new semantics from scratch.

\---

\# 6\. Locked operating rules

\#\# 6.1 Locked authoring split
\- Legal drafts constraints and meaning
\- Product maps surfaces, triggers, and behaviour
\- Marketing tunes tone after semantics are fixed

\#\# 6.2 Locked sequencing rule
For each surface/state:
1\. system truth
2\. must-not-imply boundary
3\. required trust cue
4\. CTA behaviour
5\. warning-family behaviour
6\. only then tone/readability polish

\#\# 6.3 Locked review rule
A trust-cue-bound state should not appear on a first-wave consequential surface without its required cue unless there is a documented reason it is still safe there.

\---

\# 7\. Open / follow-on

\#\# 7.1 Full screen-by-screen first-wave inventory completion
Product fills all real first-wave screens using the canonical template.

\#\# 7.2 State family final freeze after rendered-surface review
Especially:
\- Guarded
\- Ready for handoff / Prepared for handoff
\- External review recommended

\#\# 7.3 Warning-family implementation placement
Map for each warning family:
\- which screens/states need it
\- what triggers it
\- whether it warns / pauses / blocks / reroutes
\- where the trust cue sits
\- whether the warning is inline, panel, modal, or state-level

\#\# 7.4 Lane 2 implication register / final surface freeze pass
Needed before calling the whole lane fully frozen for production-grade rollout.

\---

\# 8\. Bottom line
Lane 2 is now structurally governed.

Not every line of UI is frozen-for-eternity, but the system now has:
\- a canonical surface tool
\- a reviewer gate
\- frozen boundary and anti-overclaim rules
\- frozen CTA hierarchy
\- frozen first-pass warning semantics
\- a mostly frozen state family
\- a strong worked pattern library

That is enough to move from copy doctrine into controlled surface build-out without semantic chaos.
