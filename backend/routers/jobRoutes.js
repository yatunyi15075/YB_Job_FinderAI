import express from "express";
import { getJobs } from "../controllers/jobController.js";
const router = express.Router();

router.post("/find", getJobs);

export default router;
