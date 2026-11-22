import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
ORIGINALS_DIR = ROOT / "data" / "originals"
EXTRACTED_DIR = ROOT / "data" / "extracted"
OUTPUT_PATH = EXTRACTED_DIR / "explanations.json"
QUESTION_NUMBER = re.compile(r"^\((\d+)\)")
PILOT_MAPPINGS = {
    "115.4-2.第一科": "115年第4-2次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260604212644.pdf",
    "115.4-2.第二科": "115年第4-2次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260604212719.pdf",
    "115.4-3.第一科": "115年第4-3次初級AI應用規劃師_第一科_人工智慧基礎概論_公告試題_20260906220418.pdf",
    "115.4-3.第二科": "115年第4-3次初級AI應用規劃師_第二科_生成式AI應用與規劃_公告試題_20260906220452.pdf",
}


def build_explanation_index() -> dict:
    entries_by_question = {}

    for pilot_name, question_id_source in PILOT_MAPPINGS.items():
        pilot_dir = ORIGINALS_DIR / "詳解" / pilot_name
        if not pilot_dir.is_dir():
            raise FileNotFoundError(f"Explanation directory not found: {pilot_dir}")

        for image_path in sorted(pilot_dir.glob("*.png")):
            number_match = QUESTION_NUMBER.match(image_path.name)
            if not number_match:
                continue

            number = int(number_match.group(1))
            question_id = f"{question_id_source}#q{number}"
            relative_path = image_path.relative_to(ROOT).as_posix()
            entries_by_question.setdefault(question_id, []).append(relative_path)

    if not entries_by_question:
        raise ValueError("No explanation PNG files were indexed.")

    entries = [
        {"question_id": question_id, "images": images}
        for question_id, images in sorted(
            entries_by_question.items(),
            key=lambda item: item[0],
        )
    ]
    pilot_entries = []
    for pilot_name in PILOT_MAPPINGS:
        pilot_entries.append(pilot_name)

    return {
        "schema_version": 1,
        "pilots": pilot_entries,
        "source_dir": "data/originals/詳解",
        "entries": entries,
    }


def main() -> int:
    index = build_explanation_index()
    OUTPUT_PATH.write_text(
        json.dumps(index, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Indexed {len(index['entries'])} explanation questions -> {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
