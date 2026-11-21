import json
import sys
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "data" / "originals"
OUTPUT_DIR = ROOT / "data" / "extracted"


def extract_pdf(source_path: Path) -> tuple[dict, list[int]]:
    reader = PdfReader(source_path)
    pages = []
    empty_pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text(extraction_mode="layout") or ""
        if not text.strip():
            empty_pages.append(page_number)
        pages.append({"page_number": page_number, "text": text})

    return (
        {
            "source_file": source_path.name,
            "extraction_method": "pypdf layout text extraction",
            "pages": pages,
        },
        empty_pages,
    )


def main() -> int:
    pdf_paths = sorted(SOURCE_DIR.glob("*.pdf"))
    if not pdf_paths:
        print(f"No PDF files found in {SOURCE_DIR}", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    failures = []

    for source_path in pdf_paths:
        try:
            extracted, empty_pages = extract_pdf(source_path)
            output_path = OUTPUT_DIR / f"{source_path.stem}.json"
            output_path.write_text(
                json.dumps(extracted, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"{source_path.name}: {len(extracted['pages'])} pages -> {output_path.name}")
            if empty_pages:
                print(
                    f"  Warning: no extractable text on pages {empty_pages}",
                    file=sys.stderr,
                )
        except Exception as error:
            failures.append((source_path.name, error))
            print(f"Failed to extract {source_path.name}: {error}", file=sys.stderr)

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
