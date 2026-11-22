import unittest

from src.build_question_bank import (
    apply_explanation_index,
    apply_scenario_classification,
    parse_questions,
)


class ParseQuestionsTests(unittest.TestCase):
    def test_parses_answers_choices_and_page_when_options_continue(self):
        pages = [
            {
                "page_number": 1,
                "text": (
                    "答案     題目\n"
                    "  B   1. 題目第一行\n"
                    "       題目第二行\n"
                    "       (A)選項甲\n"
                    "       (B)選項乙\n"
                ),
            },
            {
                "page_number": 2,
                "text": (
                    "答案     題目\n"
                    "       (C)選項丙\n"
                    "       (D)選項丁\n"
                    "  A   2. 第二題題幹\n"
                    "       (A)甲\n"
                    "       (B)乙\n"
                    "       (C)丙\n"
                    "       (D)丁\n"
                ),
            },
        ]

        questions = parse_questions(pages)

        self.assertEqual(len(questions), 2)
        self.assertEqual(questions[0]["answer"], "B")
        self.assertEqual(questions[0]["source_page"], 1)
        self.assertEqual(questions[0]["question"], "題目第一行 題目第二行")
        self.assertEqual(questions[0]["choices"]["D"], "選項丁")
        self.assertEqual(questions[1]["source_page"], 2)
        self.assertEqual(questions[1]["answer"], "A")

    def test_normalizes_fullwidth_answer_marker(self):
        pages = [
            {
                "page_number": 1,
                "text": (
                    "Ｃ   1. 題幹\n"
                    "       (A)甲\n"
                    "       (B)乙\n"
                    "       (C)丙\n"
                    "       (D)丁\n"
                ),
            }
        ]

        questions = parse_questions(pages)

        self.assertEqual(questions[0]["answer"], "C")


class ExplanationIndexTests(unittest.TestCase):
    def test_applies_explanation_images_to_matching_question(self):
        questions = [{"id": "paper#q1"}, {"id": "paper#q2"}]
        index = {
            "schema_version": 1,
            "entries": [
                {
                    "question_id": "paper#q1",
                    "images": ["data/originals/detail/01.png"],
                }
            ],
        }

        apply_explanation_index(questions, index)

        self.assertEqual(
            questions[0]["explanation_images"],
            ["data/originals/detail/01.png"],
        )
        self.assertEqual(questions[1]["explanation_images"], [])

    def test_rejects_explanation_for_unknown_question(self):
        index = {
            "schema_version": 1,
            "entries": [
                {
                    "question_id": "missing#q1",
                    "images": ["data/originals/detail/01.png"],
                }
            ],
        }

        with self.assertRaisesRegex(ValueError, "valid questions"):
            apply_explanation_index([{"id": "paper#q1"}], index)


class ScenarioClassificationTests(unittest.TestCase):
    def test_applies_tags_and_marks_unreviewed_questions(self):
        questions = [
            {"id": "paper#q1"},
            {"id": "paper#q2"},
            {"id": "paper#q3"},
        ]
        classification = {
            "schema_version": 1,
            "categories": [{"id": "knowledge_qa", "label": "知識檢索與問答"}],
            "reviewed_question_ids": ["paper#q1", "paper#q2"],
            "tags_by_question": {"paper#q1": ["knowledge_qa"]},
        }

        categories = apply_scenario_classification(questions, classification)

        self.assertEqual(categories[0]["id"], "knowledge_qa")
        self.assertTrue(questions[0]["scenario_reviewed"])
        self.assertEqual(questions[0]["scenario_tags"], ["knowledge_qa"])
        self.assertTrue(questions[1]["scenario_reviewed"])
        self.assertEqual(questions[1]["scenario_tags"], [])
        self.assertFalse(questions[2]["scenario_reviewed"])

    def test_rejects_unknown_scenario_tags(self):
        questions = [{"id": "paper#q1"}]
        classification = {
            "schema_version": 1,
            "categories": [{"id": "knowledge_qa", "label": "知識檢索與問答"}],
            "reviewed_question_ids": ["paper#q1"],
            "tags_by_question": {"paper#q1": ["unknown"]},
        }

        with self.assertRaisesRegex(ValueError, "Invalid scenario tags"):
            apply_scenario_classification(questions, classification)

    def test_rejects_reviewed_question_ids_missing_from_bank(self):
        classification = {
            "schema_version": 1,
            "categories": [],
            "reviewed_question_ids": ["missing#q1"],
            "tags_by_question": {},
        }

        with self.assertRaisesRegex(ValueError, "must be unique and exist"):
            apply_scenario_classification([{"id": "paper#q1"}], classification)


if __name__ == "__main__":
    unittest.main()
