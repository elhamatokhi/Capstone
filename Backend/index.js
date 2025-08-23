import express, { Router } from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();
const app = express();
const PORT = 3000 || process.env.PORT;

// Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));
app.use(express.json());
app.use(
  session({
    secret: "secret_key",
    resave: false, // resource friendly
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");

app.use("/", router);
app.listen(PORT, () => {
  console.log(`Server is listerning....on port ${PORT}`);
});
