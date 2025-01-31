import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Simulations endpoint' });
});

export default router;
