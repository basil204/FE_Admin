const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const app = express();
app.use(cors());

// File path to store data
const dataFilePath = path.join(__dirname, "data.json");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // To parse JSON requests
app.post("/api/data", (req, res) => {
  const { name, banner, url } = req.body;
  const data = readDataFromFile();
  const newId = data.length ? data[data.length - 1].id + 1 : 1;
  const newItem = { id: newId, name, banner, url };
  data.push(newItem);
  writeDataToFile(data);
  res.status(201).json(newItem);
});

// READ all data
app.get("/api/data", (req, res) => {
  const data = readDataFromFile();
  res.json(data);
});

// READ single data by id
app.get("/api/data/:id", (req, res) => {
  const { id } = req.params;
  const data = readDataFromFile();
  const item = data.find((d) => d.id === parseInt(id));
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json(item);
});

// UPDATE data by id
app.put("/api/data/:id", (req, res) => {
  const { id } = req.params;
  const { name, banner, url } = req.body;
  const data = readDataFromFile();
  const itemIndex = data.findIndex((d) => d.id === parseInt(id));

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  data[itemIndex] = { id: parseInt(id), name, banner, url };
  writeDataToFile(data);
  res.json(data[itemIndex]);
});

// DELETE data by id
app.delete("/api/data/:id", (req, res) => {
  const { id } = req.params;
  const data = readDataFromFile();
  const itemIndex = data.findIndex((d) => d.id === parseInt(id));

  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  data.splice(itemIndex, 1);
  writeDataToFile(data);
  res.status(204).send();
});
function readDataFromFile() {
  try {
    const data = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeDataToFile(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
