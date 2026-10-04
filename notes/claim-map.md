# Claim Map

This file separates reported evidence from my interpretation.

| Claim used in this repository | Evidence location in the paper | Boundary |
|---|---|---|
| The study reports 66 configurations | Abstract; Sections 1 and 3.1 | Paper result |
| Four configurable harnesses were crossed with five models on three benchmarks | Abstract; Section 3.1 | Paper result |
| Claude and GPT reverse order across harnesses on Terminal-Bench 4 | Section 4.1; Table 1 | Paper result |
| The Claude-minus-GPT gap shifts by 38.09 points between OpenHands and PI | Section 4.1 | Paper result |
| The best harness changes across task collections for four of five models | Section 4.2; Table 3 | Paper result |
| openJiuwen is Kimi's highest-scoring harness on all three benchmarks | Section 4.2; Figure 2 | Paper result limited to tested settings |
| Native pairings are not consistently best | Section 4.1; Table 2 | Paper result |
| Higher cost does not reliably produce a higher score | Section 4.3; Figure 1 | Paper result |
| GPT + PI beats GPT + DSH on Terminal-Bench 4 at less than one quarter of the cost | Abstract; Section 4.3; Tables 1 and 6 | Paper result |
| 180 of 192 coded responses to failure signals were model-initiated | Section 5.1 | Paper result |
| A bounded timeout turned a GIMP hang into feedback and recovery | Section 5.1; Figure 3 | Matched paper case study |
| 35 failed Kimi/openJiuwen runs self-reported that requirements were verified | Section 5.2; Figure 4 | Paper result |
| Reusing a self-built acceptance test can preserve a wrong conclusion | Section 5.2; Figure 5 | Paper mechanism and case study |
| A generic continue message can override a human hand-back | Section 6; Table 4 | Paper case and author implication |
| Model, harness and task should be evaluated together | Abstract; Sections 1, 6 and 8 | Authors' central claim |
| Runtime needs typed errors, timeouts and explicit escalation states | Section 6; Table 4 | Authors' proposal, not tested intervention |
| Enterprise SQL/BI/ADF examples | Not in the paper | My applied interpretation |
| Production gate should combine quality, safety, cost and latency | Not directly tested in the paper | My architecture recommendation |

## Numerical source used by the data explorer

- Scores: Table 1
- Total configuration cost: Table 6
- Per-task cost: total cost divided by the fixed benchmark denominator
  - TUA-Bench: 120
  - ALE-CLI: 99
  - Terminal-Bench 4: 63

The CSV stores the exact four-decimal scores shown in Table 1 and the two-decimal cost totals shown in Table 6. Display values are rounded for readability.
