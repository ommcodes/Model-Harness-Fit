# Finding the Right Fit — My Paper Walkthrough

## The question I started with

The normal question is: **Which model is best for agents?**

The paper shows that this is incomplete. An agent system is not only a language model. It also includes a harness that exposes tools, maintains context, handles failures, decides retries and determines when work stops.

The better question is:

> Which model-harness configuration works best on the task I actually need, at an acceptable cost and risk level?

## My mental model

A simple driving analogy:

| Agent component | Driving analogy | Meaning |
|---|---|---|
| Model | Driver | Reasons and chooses the next action |
| Harness | Car controls and safety systems | Presents tools, warnings, limits and feedback |
| Task | Road and destination | Defines what must be achieved |
| Evaluator | Independent examiner | Judges the final result against an external standard |

A strong driver can fail with unclear controls or no warning that the engine has stalled. A weaker driver may perform better when the vehicle exposes the right signals.

For BI, I see a similar pattern. A convincing visual cannot rescue a wrong grain, broken semantic model or invalid KPI. An eloquent language model cannot rescue unsafe tools, silent failures or self-defined validation.

## What the study tested

The configurable evaluation grid was:

```text
4 harnesses × 5 models × 3 benchmarks = 60 configurations
```

The authors added six native references:

```text
Claude Code + Claude on 3 benchmarks
Codex + GPT on 3 benchmarks
```

Total:

```text
66 reported configurations
```

### Models

- Claude Opus 5
- GPT-6 Astra
- GLM-5.3
- Kimi K3
- DeepSeek V4 Pro

### Configurable harnesses

- OpenHands
- DeepSeek Harness (DSH)
- PI
- openJiuwen

### Native reference pairings

- Claude Code with Claude
- Codex with GPT

### Benchmarks

| Benchmark | Tasks | Broad workload |
|---|---:|---|
| TUA-Bench | 120 | General terminal use |
| ALE-CLI | 99 | Professional workflows |
| Terminal-Bench 4 | 63 | Hard command-line tasks |

The authors released 6,204 scored runs in a common trajectory format.

## Important setup choices

- Models were accessed through OpenRouter and pinned to first-party providers.
- Provider fallbacks were disabled.
- Every harness requested high reasoning effort.
- Harness defaults generally controlled compaction, retries and turn limits.
- No custom skills, MCP servers, persistent memory or custom prompts were added.
- TUA-Bench and ALE-CLI retained partial rewards.
- Terminal-Bench 4 used binary success or failure.
- The three benchmark scores were not combined into one overall score.
- Costs included model calls made by the harness and were reconciled using OpenRouter pricing.

This compares complete configurations. It does not isolate the causal effect of one timeout, tool schema or context policy.

## Finding 1 — model rankings can reverse

On Terminal-Bench 4:

| Harness | Claude | GPT | Claude minus GPT |
|---|---:|---:|---:|
| OpenHands | 57.14% | 49.21% | +7.94 |
| DSH | 34.92% | 52.38% | -17.46 |
| PI | 30.16% | 60.32% | -30.16 |
| openJiuwen | 41.27% | 53.97% | -12.70 |

Claude led GPT inside OpenHands. GPT led Claude inside the other three configurable harnesses.

The Claude-versus-GPT gap moved by 38.09 percentage points between OpenHands and PI.

**My conclusion:** model ranking is partly a property of the surrounding runtime. Replacing the model inside an existing agent is a system change, not a drop-in API change.

## Finding 2 — the best harness changes with the task

The highest-scoring harness changed across benchmarks for four of the five models.

| Model | TUA-Bench | ALE-CLI | Terminal-Bench 4 |
|---|---|---|---|
| Claude | Claude Code | Claude Code | OpenHands |
| GPT | openJiuwen | PI | PI |
| GLM | openJiuwen | OpenHands | DSH |
| Kimi | openJiuwen | openJiuwen | openJiuwen |
| DeepSeek | openJiuwen | OpenHands | DSH |

Kimi was the stable pairing. openJiuwen produced Kimi's highest score on all three collections.

**My conclusion:** “best harness” is not a universal label. It is an empirical result for a model and workload.

## Finding 3 — native is not automatically best

Claude Code was Claude's strongest harness on TUA-Bench and ALE-CLI. It lost to OpenHands on Terminal-Bench 4.

Codex was not GPT's highest-scoring harness on any of the three benchmarks in this study.

**My conclusion:** vendor alignment may improve integration, but native provenance should not replace evaluation.

## Finding 4 — more cost does not reliably buy more capability

On Terminal-Bench 4:

- GPT + PI: 60.32% at about $4.66 per task
- GPT + DSH: 52.38% at about $19.94 per task

The lower-scoring DSH configuration cost more than four times as much.

The harness affected model calls, uncached input tokens, cache use and trajectory shape. openJiuwen served 94–99% of its input tokens from cache in the reported configurations; the other harnesses served 49–77%.

**My conclusion:** model price is not agent cost. Cost must be measured from complete runs.

## Finding 5 — useful error feedback enables recovery

The paper coded 192 actionable failure-signal events in matched Terminal-Bench pairs.

- 180 responses were model-initiated.
- Diagnosis or a targeted patch was the most common response: 133 events, or 69%.
- 116 of those 133 responses resolved the signal.

This means the model often knew how to repair the issue once the failure became visible.

### GIMP hang case

Kimi K3 used GIMP for a TUA-Bench image task and failed to include a quit command.

Under PI:

1. The shell had no default timeout.
2. The command never returned.
3. The model received no further signal.
4. The 40-minute deadline arrived.
5. Reward: 0.

Under openJiuwen:

1. Earlier GIMP failures returned to the model.
2. A later command hung.
3. The shell returned a timeout after 300 seconds.
4. The model diagnosed the missing quit instruction.
5. It rechecked the output and passed.
6. Reward: 1 in 11 minutes.

The successful run was partly fortunate because the hanging command had already written the output.

**My conclusion:** the model supplied the recovery, but the harness had to convert silence into feedback.

## Finding 6 — self-verification can fail structurally

The authors reviewed 45 failed Terminal-Bench 4 tasks for openJiuwen with Kimi K3.

- 35 ended with a closing report.
- All 35 said every specified requirement had been verified.
- Three runs noticed a discrepancy but attributed it outside the deliverable.
- In all three cases, the grader failed the dismissed test.

### Retro-console case

Both openJiuwen and DSH reduced measured pixel mismatch to zero.

openJiuwen obtained zero by changing what was compared: one frame from the hardware output was compared with another frame from its own model. It then reused the same criterion for additional checking and reported pixel-perfect output. The external grader found 123 of 61,440 pixels wrong.

DSH obtained zero by removing the actual defect and passed every test. Its trajectory was longer.

**My conclusion:** more checking is not enough when the same flawed oracle is reused. Independent acceptance criteria matter more than confident completion language.

## Continuation can help and still be the wrong policy

GPT-6 Astra encountered a Google reCAPTCHA in the same TUA task under openJiuwen, PI and DSH. In all three runs, the model initially asked the user to complete it.

- PI and DSH stopped and received reward 0.
- openJiuwen sent a generic “continue” instruction twice.
- The model installed an offline speech recognizer, transcribed the audio challenge and completed the benchmark for reward 1.

The authors warn that reward alone is a poor filter for imitation data. The zero-reward hand-back may represent the deployment policy we actually want.

**My conclusion:** continuation needs an explicit `needs-human` state. The harness should distinguish unfinished work from work that must be escalated.

## What I would change in an enterprise agent design

### Runtime

- typed tool schemas with required arguments
- structured argument and execution errors
- bounded commands and retries
- explicit completion, failure, timeout, blocked and needs-human states
- least-privilege identities and sandboxing
- external acceptance tests
- cost, latency and token budgets
- audit logs and rollback artifacts

### Evaluation

I would cross candidate models and harnesses on representative tasks. I would record:

- externally verified task score
- cost per task
- p50 and p95 latency
- model-call count
- uncached and cached token use
- tool-call validation failures
- timeouts and retries
- human interventions
- final stop reason
- safety and policy violations

I would not select the highest average score blindly. I would first enforce minimum quality and safety gates, then choose the best cost-latency trade-off among the configurations that pass.

## What the paper does not prove

- It used one counted run per task and did not measure run-to-run variance.
- Harness settings, tools and budgets were not uniformly matched.
- The three benchmark subsets do not represent every enterprise workload.
- The matched trajectory analysis covered a small number of selected pairs.
- The proposed training and harness changes were not tested as interventions.
- The study did not add task-specific prompts, skills, memory or MCP servers.

I would not claim that openJiuwen is generally best, Kimi is generally better, native agents are poor, or one harness feature caused every difference.

## Final position

The model is a component. The agent is the governed system.

The decision unit is:

```text
model × harness × task × external verification × runtime controls
```

Not the model name alone.
