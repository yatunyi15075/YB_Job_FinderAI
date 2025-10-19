import express from "express";
import { 
  saveApplication, 
  getApplicationHistory, 
  deleteApplication 
} from "../controllers/applicationController.js";

const router = express.Router();

// Save a job application
router.post("/apply", saveApplication);

// Get application history for a user
router.get("/history/:clerkUserId", getApplicationHistory);

// Delete an application
router.delete("/history/:clerkUserId/:applicationId", deleteApplication);

export default router;
