import { Router } from "express";
import pool from "../config/db.js";
const router = Router();

router.get("/", (req, res) => {
  res.send("You got less than 40 hours..👌");
});

export default router;
