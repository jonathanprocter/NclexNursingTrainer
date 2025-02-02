
import { Router } from 'express';
import { quizGeneratorService } from '../services/quiz-generator.service';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { topic, difficulty, previousMistakes } = req.body;
    const quiz = await quizGeneratorService.generateQuiz(topic, difficulty, previousMistakes);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

export default router;
