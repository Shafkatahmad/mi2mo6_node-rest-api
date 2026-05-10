import { createServer, IncomingMessage, Server } from "http";

const server: Server = createServer((req: IncomingMessage, res) => {
  console.log(req);
});

server.listen(5000, () => {
  console.log("Server is running on the port 5000");
});
