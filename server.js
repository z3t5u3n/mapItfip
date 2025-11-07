const express = require("express");
const compression = require("compression");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(compression());
app.use(express.static(path.join(__dirname, "build"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".br")) {
      res.setHeader("Content-Encoding", "br");
      if (filePath.endsWith(".js.br")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (filePath.endsWith(".wasm.br")) {
        res.setHeader("Content-Type", "application/wasm");
      }
    }
  },
}));

// 👇 Versión compatible con Express 5
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  //console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
