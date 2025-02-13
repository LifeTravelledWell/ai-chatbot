const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Hello, AI Chatbot is live on Vercel!");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
