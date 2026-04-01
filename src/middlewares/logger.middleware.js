const fs = require("fs");
const os = require("os");
const path = require("path");

const logFilePath = path.join(__dirname, "..", "config", "log.txt");

function logger(req, res, next) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const logLine = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms${os.EOL}`;

    fs.appendFile(logFilePath, logLine, (error) => {
      if (error) {
        console.error("Failed to write request log:", error.message);
      }
    });
  });

  next();
}

module.exports = logger;
