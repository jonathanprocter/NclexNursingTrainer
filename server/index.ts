import { Server } from './config/server';

async function bootstrap() {
  try {
    const server = await new Server().initialize();
    await server.start();
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
