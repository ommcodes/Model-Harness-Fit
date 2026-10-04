# The Best Model Is Not Enough

> My practical reading notes on \*\*Finding the Right Fit: Model-Harness Interactions across Agent Tasks\*\*.

## Why I wrote this

Coming from BI and data engineering, I would not trust a dashboard only because the visual looks good. I would check the source, semantic grain, refresh logic, security and validation.

I realised I was not applying the same discipline to agent systems. I was still giving too much weight to the model name.

This paper makes a stronger engineering point:

> The useful unit of evaluation is not the model alone. It is the \*\*model × harness × task\*\* configuration.

A harness decides how tools are exposed, what remains in context, how errors return, when a command times out, whether work continues and what counts as completion. Those choices can change model ranking, task success and cost.

## What is in this repository

* `index.html` — the complete interactive reading experience; CSS, JavaScript and data are embedded, so this file also works by itself
* `assets/styles.css` — editable source copy of the responsive light/dark design
* `assets/app.js` — editable source copy of the charts, filters, case studies and evaluation-plan builder
* `data/configurations.csv` — all 66 reported score-cost configurations
* `data/configurations.js` — editable browser-ready source copy of the same data
* `notes/paper-walkthrough.md` — a linear Markdown version of my notes
* `notes/claim-map.md` — claim-to-source map and interpretation boundary
* `sources.bib` — citation for the original paper

The site has no framework, package install, analytics or external runtime dependency. It works as a static GitHub Pages site.

## What the site covers

1. A beginner-friendly explanation of models, harnesses, tools, tasks and evaluators
2. The study design: 66 configurations across three benchmarks
3. The major findings, including ranking reversals and task-dependent fit
4. An interactive explorer for score and cost across all configurations
5. Matched trajectory cases explaining timeout, continuation and verification failures
6. My application of the findings to SQL, BI, workflow and enterprise agent systems
7. The paper's limitations and claims I would not make from the evidence

## Evidence discipline

I kept three boundaries explicit:

* **Paper result** — numbers, comparisons, task counts, trajectories and limitations reported by the authors
* **My interpretation** — what I believe the result means for agent architecture and evaluation
* **Applied example** — BI, SQL, ADF and enterprise scenarios that were not tested in the paper

I did **not** reproduce the experiments. The data explorer combines the paper's score table with its cost table. Cost per task is calculated by dividing each reported configuration total by the benchmark's fixed task count.

## Main conclusion

I would not approve a model for production in isolation.

I would evaluate complete configurations on representative work and require evidence for:

* task quality
* independent verification
* cost and latency
* tool failure recovery
* bounded retries and timeouts
* security and permissions
* explicit completion and escalation states
* traceability and rollback

Among configurations that pass those gates, I would choose the best score-cost-latency trade-off.

## Primary source

Yixuan Li, Yiyun Zhou, Yao Long Teng, Fuchao Yang, Yanchen Deng, Zhiyi Lyu, Xuyu Dong, Feng Chen and Bo An. **Finding the Right Fit: Model-Harness Interactions across Agent Tasks**. arXiv:2610.00917, 2026.

* Paper: [https://arxiv.org/abs/2610.00917](https://arxiv.org/abs/2610.00917)
* Authors' code: [https://github.com/liyix/finding-the-right-fit](https://github.com/liyix/finding-the-right-fit)
* Authors' trajectory dataset: [https://huggingface.co/datasets/yixuanli97/finding-the-right-fit](https://huggingface.co/datasets/yixuanli97/finding-the-right-fit)

## License

The site code and my original commentary are released under the MIT License in this repository. The paper, authors' code, benchmarks and released dataset retain their own licenses and terms.

