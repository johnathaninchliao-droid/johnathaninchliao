# Agent Shared Workspace Instructions

This project is a study application for AI application planning exam questions.

## Project Location

- Source code: `src/`
- Original exam materials: `data/originals/`
- OCR and extracted text: `data/extracted/`
- Project documentation: `docs/`
- Shared project context: `docs/專案共用資源.md`

## Required Workflow

1. Read `docs/專案共用資源.md` before starting work.
2. Treat `data/originals/` as the source of truth for original PDFs and images.
3. Treat `data/originals/` as read-only: do not modify, move, rename, delete, or overwrite any file there.
4. Put generated OCR text and derived data under `data/extracted/`.
5. Keep source code under `src/`.
6. Record important decisions and shared conventions under `docs/`.
7. Before editing, inspect existing files instead of assuming their contents.
8. When adding a feature, update the directly related documentation and add focused tests when applicable.

## Collaboration Rules

- All agents must use the same project root:
  `C:\Users\User\Documents\備考專案檔案夾`
- **Originals Directory Protection Policy**: All files under `data/originals/` are read-only baseline. Never modify, move, rename, delete, or overwrite them. Existing agent-named folders there are user-placed reference material, not generated output.
- **Generated-Area Agent Workspaces**: The `opencode/` and `antigravity/` subfolders under `data/extracted/詳解/<題組>/` are the exclusive writable workspaces of OpenCode and Antigravity respectively. Each agent may write only inside its own folder; other agents must not edit those folders. Generated outputs belong in `data/extracted/`, never in `data/originals/`.
- **Independent Parallel Work Policy**: Antigravity and OpenCode execute their assigned lanes independently and in parallel. OpenCode performs text verification and source tracing in `data/extracted/詳解.文字確認(opencode)/<題組>/`; Antigravity performs diagram layout, rendering, and visual verification in `data/extracted/詳解/<題組>/antigravity/`. Neither lane waits for the other as a handoff prerequisite. Discrepancies are recorded in the shared log and reported to the responsible agent, never fixed by editing the other agent's files. Human final approval before commit remains mandatory.
- **Designated Task Execution Policy**: Inside each agent's own generated-area workspace (and elsewhere outside the protected originals baseline), Antigravity and OpenCode may proceed autonomously to execute their designated tasks directly to completion without asking for step-by-step authorization.
- **Notebook Gemini Role & Originals Intake Policy (2026-11-26)**: Notebook Gemini is an assistant inside the NotebookLM notebook `ipas.動態回饋分析模式`; it is **not an agent** and handles only notebook-internal work. No agent waits for its reply: after the 115.4-1 第一科 opencode pilot proved feasible, the user decided to run `詳解.文字確認` directly. OpenCode completes text verification from `data/originals/` exam PDFs and public-source checks independently. Everything destined for `data/originals/` must pass **human review before being placed there**; `data/originals/` itself stays read-only — no agent may move, add, modify, or delete anything in it. The "Gemini 並列比較" field in OpenCode outputs is therefore marked "不適用" (not "待補"), with no claim of having compared any PNG.
- **Antigravity Output Ownership Policy**: If another agent finds an error in Antigravity's implementation or generated output, do not directly edit it. Report the exact file, location, and mismatch to Antigravity so it can correct its own work; verify the result after Antigravity updates it.
- **Shared Baseline Comparison Policy**: OpenCode, Antigravity, and Copilot may all read and compare Antigravity's output against the baseline under `data/originals/`, which is read-only. `data/originals/整理建構問題框架..docx` (Region 1) is the question framework authored by the user; the user also manually organized and placed the sources of the NotebookLM notebook `ipas.動態回饋分析模式` into `data/originals/`. Notebook Gemini produced the explanation PNGs under `data/originals/詳解/` from that framework and those sources. All three agents must understand the correspondence between the framework items and each position on the diagrams so their interpretations stay consistent. All original files under `data/originals/`, including the PNGs and user-placed agent-named folders, are user-provided baseline: read only, never move, modify, overwrite, or export them; generated outputs belong under `data/extracted/`. Any discrepancy is reported to the responsible agent, not edited directly. The two exam sets `115.4-1 第一科` and `115.4-1 第二科` have been placed by the user under `data/originals/詳解/` as reference baseline; agent workspaces are now under `data/extracted/詳解/`. The sets are still partial (第一科 PNG 1–42、第二科 PNG 1–30 與 Antigravity HTML 31–50). Desktop leftovers are not baseline and must not be treated as such.
- **Framework-to-Diagram Example Policy**: `data/originals/3代理需知範例/` is the shared worked example for framework-to-position mapping. It contains `範例.docx` (the framework text) and `(25)115.4-1.第一科.png` (the corresponding diagram). The mapping is: scenario with highlighted keywords at the top; wrong-option reasoning (B/C/D) in the two-column green/red boxes; web-verified comparison, in-box reasoning, and future answer-selection guidance inside the colored boxes; `115.4-1.(08)` standard layout with accurate arrows and no text overlap; lower-right = inventor (year) and design purpose, which is the **source attribution**; lower-middle = exam motive/design purpose and keywords; lower-left = exam set and question number plus a beginner/intermediate scope assessment with reasons. All content other than the lower-right attribution is accurate information compiled from searches. This directory is part of `data/originals/` and is read-only.
- **Purpose-First Layout Redesign Policy**: The original diagrams use a horizontal banner at the top so the stage steps are immediately readable, and a vertical feedback-loop diagram on the right to convey the scenario. Redesign may change direction, arrangement, or presentation as long as these purposes survive: the upper area must still make the step sequence clear, and the right-side feedback loop must still convey the scenario. Visual verification checks whether the purpose is achieved, not whether the form matches the original exactly. Losing the purpose is the only deviation.
- **All-Explanation Cross-Reference Policy**: `data/originals/詳解/` contains 210 Notebook Gemini PNGs across four exam sets (115.4-2 第一科: 52, 115.4-2 第二科: 50, 115.4-3 第一科: 57, 115.4-3 第二科: 51). All three agents may use every one of these diagrams as a shared cross-reference for position layout. The diagrams are highly consistent with one another in position layout, so any of them can serve as a cross-check baseline: scenario at top, wrong-option reasoning in the two-column green/red boxes, in-box reasoning and future answer guidance, lower-right inventor (year) and design purpose as the **source attribution**, lower-middle exam motive and keywords, lower-left question number and scope assessment. Content other than the lower-right attribution is accurate information compiled from searches. All files are read-only; never move, modify, or overwrite them.
- **OpenCode Role Note**: OpenCode performs text-content verification and source tracing, which does not require image input. The currently active model (`opencode/big-pickle`) cannot read images, but this no longer blocks its workflow because visual verification has been assigned to Antigravity. If text must be extracted from an image, switch to an image-capable model (e.g. `opencode/nemotron-3.5-super-vl-free`) or ask Antigravity to provide the text. Never upload copyrighted exam content to external services; verify only public facts such as inventor names, years, and technical definitions.
- **Shared Communication Log Policy (Mechanism 1)**: Before starting work, read `docs/代理溝通/00_現況與需求.md` and the three agent logs (`copilot.md`, `antigravity.md`, `opencode.md`), or read the generated `docs/代理溝通/最新動態.md` for a quick summary. After each conversation or task, the acting agent must append a summary to its own log and update `00_現況與需求.md` when the workflow stage, user requirements, or support needs change. Use `powershell -File scripts\add-agent-log.ps1` to append standardized entries; `最新動態.md` is regenerated automatically. Run `powershell -File scripts\watch-agent-logs.ps1` for continuous monitoring, or add `-Once` for a single refresh. These files are the shared source for workflow status, user intent, and issue support so every agent can see what the others are doing.
- Do not place project-specific instructions only inside a single tool's session memory.
- If information is needed by more than one agent, save it in `docs/` or this file.
- Do not move or copy copyrighted exam materials outside this workspace.

## Explanation Diagram Work Assignment

The explanation diagram workflow is:

```text
Notebook Gemini (structured content)
  -> store under data/originals/
  -> human fact and answer review
  -> two independent parallel lanes (neither blocks the other):
       OpenCode   : text verification and source tracing -> data/extracted/詳解.文字確認(opencode)/<題組>/
       Antigravity: programmatic layout, PNG, visual verification -> data/extracted/詳解/<題組>/antigravity/
  -> human final approval
  -> Copilot updates the index and prepares the GitHub answer section
  -> commit
  -> Copilot reports the completed question number
```

- Notebook Gemini is responsible for extracting the scenario, highlighted keywords, correct and incorrect option reasoning, comparison with credible web sources, exam motive, inventor and design purpose, difficulty assessment, and future answer-selection guidance. Save this intermediate result as structured JSON under `data/originals/`; do not use it as the final layout.
- The first human review verifies the original question, answer, source-supported facts, source notes, inventor/year, design purpose, and difficulty against `data/originals/`. Do not proceed to final approval until this review passes.
- Antigravity works independently in `data/extracted/詳解/<題組>/antigravity/`: converts reviewed structured content into a reproducible HTML/CSS or SVG layout, renders PNG files, preserves the standard two-column green/red layout for option 2 and a single tall box for the remaining columns, accurate arrows, line wrapping, and the lower-left, lower-middle, and lower-right blocks. Reusable rendering code may stay under `src/`; question-specific outputs belong in its own question-set folder. Antigravity also performs its own visual verification, including the GitHub Pages rendered version: text overflow, line wrapping, arrow endpoints, box heights, footer placement, and consistency with the `115.4-1.(08)` standard when that reference exists. Human final approval remains as a second check.
- OpenCode works independently in `data/extracted/詳解.文字確認(opencode)/<題組>/`: checks the framework docx, structured JSON, original PDFs, and notebook sources; verifies source-supported claims such as inventor, year, and design purpose through web search; and records a traceability table under `docs/` or `data/extracted/` plus its findings in its own `opencode/` folder. It does not wait for Antigravity's layout and never edits Antigravity's folder or other baseline files. Discrepancies are reported through the shared log to Antigravity. OpenCode remains active in this role and is not paused.
- Copilot updates the explanation index and prepares the approved output for the public GitHub answer section.
- Human final approval is mandatory before commit. Automated checks do not replace this review.
- A pilot one-question implementation must pass all checks before batch generation starts.
- Explanation images belong under `data/originals/詳解/`; generated or derived images are also subject to the existing privacy and `.gitignore` decisions. Do not remove ignore rules or publish copyrighted notebook or original diagram assets through the public repository.
- When explanation JSON, generated image files, or notebook documents still require adjustment, keep them under `data/originals/` for direct source comparison and local-only regeneration. The entire `data/originals/` directory is ignored by Git. The five-step documentation review must include source-supported lower-right attribution, and nothing is final until human review. Only approved answer-framework output belongs in publishable GitHub paths.
- Each question's diagram flow and structure must be derived from that question's prompt, choices, and reviewed explanation. Existing diagrams may inform visual style, not supply another question's process semantics.
