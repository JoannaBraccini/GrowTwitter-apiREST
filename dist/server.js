"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_server_1 = require("./express.server");
const app = (0, express_server_1.createServer)();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
