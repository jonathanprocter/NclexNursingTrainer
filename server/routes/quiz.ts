
import { Router } from 'express';
import { quizGeneratorService } from '../services/quiz-generator.service';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { topic, difficulty, previousMistakes, examType, userId } = req.body;
    const userPerformance = await getUserPerformance(userId) || 0.5;
    const questions = await quizGeneratorService.generateQuestions(
      examType,
      userPerformance,
      userId
    );
    const quiz = await quizGeneratorService.generateQuiz(topic, difficulty, previousMistakes);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
