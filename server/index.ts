import { Server } from './config/server';

async function bootstrap() {
  try {
    const server = new Server();
    await server.start();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
