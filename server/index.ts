import express from 'express';
import cors from 'cors';
import { routes } from './routes';

const app = express();
const PORT = 4003;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;