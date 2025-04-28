import "dotenv/config";
import { createServer } from "./express.server";

const app = createServer();
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
