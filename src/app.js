const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./config/db");
const passport = require("./config/passport");
const chatRoutes = require("./routes/chat.routes");
const authRoutes = require("./routes/auth.routes");
const logger = require("./middlewares/logger.middleware");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "social-auth-secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(logger);
app.use("/api", chatRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
