# Extracted Exam Data

This directory contains generated text and question data derived from
`../originals/`. The original PDFs remain the source of truth.

Each per-PDF JSON file stores extracted text page by page and retains the exact
source filename. `questions.js` is the structured question bank consumed by the
local study page; each question includes its source filename and page number.
`scenario_classification.json` contains the current scenario labels. It records
reviewed question IDs separately from tags, so a reviewed question with no
suitable real-world scenario remains untagged rather than being forced into a
category. These labels are an initial project classification, not an official
exam syllabus.

Regenerate the data from the project root:

```powershell
python -m pip install -r requirements.txt
python src\extract_pdfs.py
python src\build_question_bank.py
```

The builder checks question numbering, answer markers, and all four options.
It also validates scenario category IDs and their reviewed question IDs before
including the tags in `questions.js`. All 400 questions have been reviewed: 327
have scenario tags and 73 are unclassified because no scenario label currently
applies. The practice filter keeps these distinct from unreviewed questions.

`explanations.json` indexes explanation images for the four 115.4-2 and 115.4-3
exam subjects.
The builder validates that each entry references a question in the bank and
adds the image paths to that question. These paths open the original PNG files
under `../originals/詳解/`; the original files are not modified or OCR-merged
into text yet. Run `python src\build_explanation_index.py` before
`python src\build_question_bank.py` when the explanation PNG set changes.
