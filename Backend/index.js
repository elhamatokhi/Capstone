import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import morgan from "morgan";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import flash from "connect-flash";
import citizenRouter from "./routes/citizenRouter.js";
import adminRouter from "./routes/adminRouter.js";
import staffRouter from "./routes/staffRouter.js";
import "./config/passport.js";

dotenv.config();
const app = express();
const PORT = 3000;

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

// Flash setup
app.use(flash());

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// local-passport
app.use(passport.initialize()); // initializes the passport
app.use(passport.session()); // Enables use of session - usually JWT is preferred over session

app.set("view engine", "ejs");
app.use("/citizen", citizenRouter);
app.use("/admin", adminRouter);
app.use("/staff", staffRouter);
app.use("/", router);
// app.use((req, res) => {
//   res.status(404).send("404: Page Not Found");
// });
app.listen(PORT, () => {
  console.log(`Server is listerning....on port ${PORT}`);
});
