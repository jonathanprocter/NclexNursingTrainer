import net from "net";

interface PortCheckConfig {
  host: string;
  port: number;
  retries: number;
  timeout: number;
  retryDelay: number;
}

class PortWaitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PortWaitError";
  }
}

async function waitForPort({
  host = "localhost",
  port,
  retries = 10,
  timeout = 1000,
  retryDelay = 1000,
}: PortCheckConfig): Promise<void> {
  let attempts = 0;

  const checkPort = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let isConnected = false;

      socket.on("connect", () => {
        isConnected = true;
        socket.destroy();
        resolve(true);
      });

      socket.on("error", () => {
        socket.destroy();
        resolve(false);
      });

      socket.setTimeout(timeout, () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  while (attempts < retries) {
    console.log(
      `Attempting to connect to ${host}:${port} (attempt ${attempts + 1}/${retries})`,
    );

    if (await checkPort()) {
      console.log(`Successfully connected to ${host}:${port}`);
      return;
    }

    attempts++;
    if (attempts < retries) {
      await delay(retryDelay);
    }
  }

  throw new PortWaitError(
    `Failed to connect to ${host}:${port} after ${retries} attempts`,
  );
}

// Example usage in your workflow configuration
async function main() {
  try {
    // Wait for your application port
    await waitForPort({
      port: 3000,
      retries: 15,
      timeout: 2000,
      retryDelay: 2000,
    });

    // Continue with the rest of your workflow
    console.log("Application is ready!");
  } catch (error) {
    if (error instanceof PortWaitError) {
      console.error("Port wait failed:", error.message);
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("Workflow failed:", error);
    process.exit(1);
  });
}

export { waitForPort, PortWaitError };
