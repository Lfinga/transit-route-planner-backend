import { config } from "./config";
import { createServer } from "./server";

const server = createServer();

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
