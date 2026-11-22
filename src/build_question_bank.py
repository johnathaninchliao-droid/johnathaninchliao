import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
EXTRACTED_DIR = ROOT / "data" / "extracted"
OUTPUT_PATH = EXTRACTED_DIR / "questions.js"
SCENARIO_CLASSIFICATION_PATH = EXTRACTED_DIR / "scenario_classification.json"
EXPLANATION_INDEX_PATH = EXTRACTED_DIR / "explanations.json"
QUESTION_START = re.compile(r"^\s*([A-DＡ-Ｄ])\s+(\d{1,3})\.\s*(.*)$")
OPTION_START = re.compile(r"^\s*\(([A-D])\)\s*(.*)$")
ANSWER_TRANSLATION = str.maketrans("ＡＢＣＤ", "ABCD")
PAGE_FOOTER = re.compile(r"^\s*第\s*\d+\s*頁，共\s*\d+\s*頁\s*$")
HEADER_LINE = re.compile(
    r"^\s*(?:.*(?:初級能力鑑定|考試日期：)|第一科：.*|第二科：.*|答案\s+題目|一、選擇題)\s*$"
)

SUBJECT_LABELS = {
    "first": "第一科｜人工智慧基礎概論",
    "second": "第二科｜生成式 AI 應用與規劃",
}


def normalize(text: str) -> str:
    return " ".join(text.split())


def parse_questions(pages: list[dict]) -> list[dict]:
    questions = []
    current = None
    active_option = None

    def finish_current() -> None:
        if current is None:
            return
        current["question"] = normalize(" ".join(current.pop("_stem")))
        current["choices"] = {
            label: normalize(" ".join(parts))
            for label, parts in current.pop("_choices").items()
        }
        questions.append(current.copy())

    for page in pages:
        page_number = page["page_number"]
        for line in page["text"].splitlines():
            if not line.strip() or PAGE_FOOTER.match(line) or HEADER_LINE.match(line):
                continue

            question_match = QUESTION_START.match(line)
            if question_match:
                finish_current()
                answer, number, first_line = question_match.groups()
                current = {
                    "number": int(number),
                    "answer": answer.translate(ANSWER_TRANSLATION),
                    "source_page": page_number,
                    "_stem": [first_line] if first_line else [],
                    "_choices": {},
                }
                active_option = None
                continue

            if current is None:
                continue

            option_match = OPTION_START.match(line)
            if option_match:
                label, first_line = option_match.groups()
                current["_choices"].setdefault(label, [])
                if first_line:
                    current["_choices"][label].append(first_line)
                active_option = label
            elif active_option:
                current["_choices"][active_option].append(line.strip())
            else:
                current["_stem"].append(line.strip())

    finish_current()
    return questions


def metadata_from_filename(source_file: str) -> dict:
    match = re.search(r"(?P<year>11[45])年.*?第(?P<session>\d+-\d+)次", source_file)
    if not match:
        raise ValueError(f"Unable to read exam year and session from {source_file}")

    if "第一科" in source_file:
        subject = "first"
    elif "第二科" in source_file:
        subject = "second"
    else:
        raise ValueError(f"Unable to read subject from {source_file}")

    return {
        "year": match.group("year"),
        "session": f"第 {match.group('session')} 次",
        "subject": subject,
        "subject_label": SUBJECT_LABELS[subject],
    }


def load_source_questions(source_path: Path) -> list[dict]:
    data = json.loads(source_path.read_text(encoding="utf-8"))
    if not isinstance(data.get("pages"), list):
        raise ValueError(f"Missing page data in {source_path.name}")

    questions = parse_questions(data["pages"])
    if not questions:
        raise ValueError(f"No questions found in {source_path.name}")

    expected_numbers = list(range(1, len(questions) + 1))
    actual_numbers = [question["number"] for question in questions]
    if actual_numbers != expected_numbers:
        raise ValueError(
            f"Question numbers in {source_path.name} are not sequential: {actual_numbers}"
        )

    for question in questions:
        missing_choices = set("ABCD") - set(question["choices"])
        empty_choices = [
            label for label, text in question["choices"].items() if not text
        ]
        if not question["question"] or question["answer"] not in question["choices"]:
            raise ValueError(
                f"Incomplete question {question['number']} in {source_path.name}"
            )
        if missing_choices or empty_choices:
            raise ValueError(
                f"Incomplete choices for question {question['number']} in "
                f"{source_path.name}: missing {sorted(missing_choices)}, "
                f"empty {sorted(empty_choices)}"
            )

    metadata = metadata_from_filename(data["source_file"])
    return [
        {
            "id": f"{data['source_file']}#q{question['number']}",
            **metadata,
            "number": question["number"],
            "question": question["question"],
            "choices": question["choices"],
            "answer": question["answer"],
            "source_file": data["source_file"],
            "source_page": question["source_page"],
        }
        for question in questions
    ]


def apply_scenario_classification(questions: list[dict], data: dict) -> list[dict]:
    if not isinstance(data, dict) or data.get("schema_version") != 1:
        raise ValueError("Invalid scenario classification schema.")

    categories = data.get("categories")
    reviewed_ids = data.get("reviewed_question_ids")
    tags_by_question = data.get("tags_by_question")
    if not isinstance(categories, list) or not isinstance(reviewed_ids, list):
        raise ValueError("Scenario categories and reviewed question IDs are required.")
    if not isinstance(tags_by_question, dict):
        raise ValueError("Scenario tags must be grouped by question ID.")

    category_ids = set()
    for category in categories:
        if (
            not isinstance(category, dict)
            or not isinstance(category.get("id"), str)
            or not category["id"].strip()
            or not isinstance(category.get("label"), str)
            or not category["label"].strip()
            or category["id"] in category_ids
        ):
            raise ValueError("Scenario categories must have unique IDs and labels.")
        category_ids.add(category["id"])

    question_ids = {question["id"] for question in questions}
    if (
        any(not isinstance(question_id, str) for question_id in reviewed_ids)
        or len(reviewed_ids) != len(set(reviewed_ids))
        or not set(reviewed_ids).issubset(question_ids)
    ):
        raise ValueError("Reviewed scenario question IDs must be unique and exist in the bank.")

    if not set(tags_by_question).issubset(set(reviewed_ids)):
        raise ValueError("Scenario tags can only be assigned to reviewed questions.")

    for question_id, tags in tags_by_question.items():
        if (
            not isinstance(tags, list)
            or any(not isinstance(tag, str) for tag in tags)
            or len(tags) != len(set(tags))
            or not set(tags).issubset(category_ids)
        ):
            raise ValueError(f"Invalid scenario tags for {question_id}.")

    for question in questions:
        question_id = question["id"]
        question["scenario_reviewed"] = question_id in reviewed_ids
        question["scenario_tags"] = tags_by_question.get(question_id, [])

    return categories


def apply_explanation_index(questions: list[dict], data: dict) -> None:
    if not isinstance(data, dict) or data.get("schema_version") != 1:
        raise ValueError("Invalid explanation index schema.")

    entries = data.get("entries")
    if not isinstance(entries, list):
        raise ValueError("Explanation entries are required.")

    question_ids = {question["id"] for question in questions}
    explanations_by_question = {}
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("Each explanation entry must be an object.")

        question_id = entry.get("question_id")
        images = entry.get("images")
        if (
            not isinstance(question_id, str)
            or question_id not in question_ids
            or not isinstance(images, list)
            or not images
            or any(not isinstance(image, str) or not image.strip() for image in images)
        ):
            raise ValueError("Explanation entries must reference valid questions and images.")

        if question_id in explanations_by_question:
            raise ValueError(f"Duplicate explanation entry for {question_id}.")
        explanations_by_question[question_id] = images

    for question in questions:
        question["explanation_images"] = explanations_by_question.get(question["id"], [])


def build_question_bank() -> dict:
    source_paths = sorted(
        path for path in EXTRACTED_DIR.glob("*.json")
        if path not in {
            SCENARIO_CLASSIFICATION_PATH,
            EXPLANATION_INDEX_PATH,
        }
    )
    if not source_paths:
        raise FileNotFoundError(
            f"No page extraction JSON files found in {EXTRACTED_DIR}. "
            "Run src/extract_pdfs.py first."
        )

    questions = []
    for source_path in source_paths:
        questions.extend(load_source_questions(source_path))

    classification_data = json.loads(
        SCENARIO_CLASSIFICATION_PATH.read_text(encoding="utf-8")
    )
    scenario_categories = apply_scenario_classification(questions, classification_data)

    explanation_data = json.loads(
        EXPLANATION_INDEX_PATH.read_text(encoding="utf-8")
    )
    apply_explanation_index(questions, explanation_data)

    return {
        "schema_version": 2,
        "question_count": len(questions),
        "scenario_categories": scenario_categories,
        "questions": questions,
    }


def main() -> int:
    try:
        bank = build_question_bank()
        OUTPUT_PATH.write_text(
            "window.QUESTION_BANK = "
            + json.dumps(bank, ensure_ascii=False, indent=2)
            + ";\n",
            encoding="utf-8",
        )
    except (FileNotFoundError, ValueError, json.JSONDecodeError) as error:
        print(error, file=sys.stderr)
        return 1

    print(f"Built {bank['question_count']} questions -> {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
