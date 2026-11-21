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
3. Do not overwrite original files under `data/originals/`.
4. Put generated OCR text and derived data under `data/extracted/`.
5. Keep source code under `src/`.
6. Record important decisions and shared conventions under `docs/`.
7. Before editing, inspect existing files instead of assuming their contents.
8. When adding a feature, update the directly related documentation and add focused tests when applicable.

## Collaboration Rules

- All agents must use the same project root:
  `C:\Users\User\Documents\備考專案檔案夾`
- Do not place project-specific instructions only inside a single tool's session memory.
- If information is needed by more than one agent, save it in `docs/` or this file.
- Do not move or copy copyrighted exam materials outside this workspace.
