"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = express_1.default.Router();
// Fetch all questions
router.get("/", async (req, res) => {
    try {
        let fetchedQuestions = await db_1.db.query.questions.findMany();
        if (!fetchedQuestions || fetchedQuestions.length === 0) {
            fetchedQuestions = [
                {
                    id: "sample_1",
                    question: "Sample Question",
                    answer: "Sample Answer",
                    category: "General",
                    explanation: "This is a sample question",
                },
            ];
        }
        res.json(fetchedQuestions);
    }
    catch (error) {
        console.error("Questions fetch error:", error);
        res.status(500).json({ error: "Failed to fetch questions" });
    }
});
// Submit an answer to a question
router.post("/:id/answer", async (req, res) => {
    try {
        const { id } = req.params;
        const { answer, userId, timeSpent } = req.body;
        const parsedId = parseInt(id);
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedId) || isNaN(parsedUserId)) {
            return res.status(400).json({ error: "Invalid question or user ID" });
        }
        const question = await db_1.db.select().from(schema_1.questions).where((0, drizzle_orm_1.eq)(schema_1.questions.id, parsedId)).limit(1);
        if (!question.length) {
            return res.status(404).json({ error: "Question not found" });
        }
        const isCorrect = answer === question[0].correctAnswer;
        // Insert answer into question history
        await db_1.db.insert(schema_1.questionHistory).values({
            userId: parsedUserId,
            questionId: parsedId,
            answer,
            isCorrect,
            timeSpent,
            timestamp: new Date(),
        });
        // Update user progress
        const progress = await db_1.db.select().from(schema_1.userProgress).where((0, drizzle_orm_1.eq)(schema_1.userProgress.userId, parsedUserId)).limit(1);
        if (progress.length) {
            await db_1.db
                .update(schema_1.userProgress)
                .set({
                totalQuestions: progress[0].totalQuestions + 1,
                correctAnswers: progress[0].correctAnswers + (isCorrect ? 1 : 0),
                lastStudied: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userProgress.userId, parsedUserId));
        }
        res.json({
            isCorrect,
            explanation: question[0].explanation,
            conceptBreakdown: question[0].conceptBreakdown || "No concept breakdown available.",
        });
    }
    catch (error) {
        console.error("Error submitting answer:", error);
        res.status(500).json({ error: "Failed to submit answer" });
    }
});
exports.default = router;
