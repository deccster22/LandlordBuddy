# First-Wave Semantic Fidelity Checklist

## Purpose
Use this checklist during implementation and review to confirm that first-wave surfaces preserve accepted semantic controls and do not drift into false certainty, false finality, or UI-level doctrine mutation.

## A. Lane 2 copy and semantic fidelity

### Protected lines
- [ ] Protected lines match the approved baseline exactly where required
- [ ] No silent swaps have been made to protected lines
- [ ] Boundary lines remain short, visible, and close to reliance moments

### State-family integrity
- [ ] `Needs review` is not collapsed into `Guarded`
- [ ] `Stale` is not collapsed into `Live confirmation required`
- [ ] `Prepared for handoff` does not imply filed, accepted, or complete
- [ ] `Referral-first` is not presented as ordinary handoff
- [ ] `On hold` is not presented as whole-account freeze

### Trust-cue binding
- [ ] Trust-cue-bound states do not appear on consequential surfaces without their required cue
- [ ] `Prepared for handoff` or `Ready for handoff` has its anti-finality clarifier where required
- [ ] `External review recommended` has the required trust cue where surfaced
- [ ] `Referral-first` has a concrete referral reason where surfaced
- [ ] `On hold` has scoped/reviewable hold truth where consequential

### CTA hierarchy
- [ ] stale -> correct CTA hierarchy preserved
- [ ] live confirmation required -> correct CTA hierarchy preserved
- [ ] wrong-channel -> stop + explain + reroute preserved
- [ ] referral-first -> help/review CTA preserved, not ordinary handoff

### Warning-family integrity
- [ ] service warnings preserve hierarchy meaning
- [ ] evidence timing warnings preserve dual-step plus override meaning
- [ ] handoff warnings preserve externality and no-filing meaning
- [ ] referral/sensitive overlay warnings preserve subtype distinctions and escalation

## B. Lane 4 lifecycle and control fidelity

### Lifecycle truth
- [ ] delete and de-identify remain distinct
- [ ] archive/matter-close does not imply delete or de-identify unless truly supported
- [ ] export/download does not imply removal from system
- [ ] hold remains scoped and reviewable
- [ ] configurable timing by class is not presented as fixed universal truth

### Auditability truth
- [ ] auditability cues map to real logs, handlers, or lifecycle state
- [ ] no tracked cue appears without substantiating product behavior

### Hold scope
- [ ] `On hold` does not imply whole-account freeze
- [ ] consequential surfaces can express meaningful hold scope/reason where needed
- [ ] hold presentation is consistent with underlying product state

### UI overclaim prevention
- [ ] privacy/security wording does not outrun implementation truth
- [ ] lifecycle wording does not promise behavior the system cannot yet perform
- [ ] deletion language does not imply immediate universal erasure
- [ ] de-identification language is not collapsed into deletion

## C. Cross-lane semantic integrity
- [ ] preparation remains separate from official action
- [ ] handoff remains separate from execution
- [ ] local validation is not presented as official acceptance
- [ ] stale-state downgrade behaves like a real control, not cosmetic UX
- [ ] generic timing copy does not outrank hearing-specific or official instructions
- [ ] renderer does not collapse blocked/guarded/external/referral states into generic pending/success
- [ ] ownership of the next action remains explicit

## Review result
- [ ] Pass
- [ ] Pass with targeted fixes
- [ ] Escalate for review event

## Notes
- affected screens:
- affected states:
- affected CTAs:
- affected trust cues:
- review hotspots:
