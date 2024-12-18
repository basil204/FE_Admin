const express = require("express");
const path = require("path");
const app = express();

// Cung cấp tệp tĩnh
app.use(express.static(path.join(__dirname, "public")));

// Route catch-all để trả về index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Khởi động server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
