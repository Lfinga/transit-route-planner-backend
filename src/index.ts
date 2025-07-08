import { createServer } from "./server";

const server = createServer();

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});