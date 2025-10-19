import pool from '../config/db.js';

// Save job application
export const saveApplication = async (req, res) => {
  const { clerkUserId, userEmail, jobTitle, company, location, jobUrl } = req.body;

  try {
    // Validate required fields
    if (!clerkUserId || !jobTitle || !company || !location || !jobUrl) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Insert application into database
    const query = `
      INSERT INTO job_applications 
      (clerk_user_id, user_email, job_title, company, location, job_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [clerkUserId, userEmail, jobTitle, company, location, jobUrl];
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Application saved successfully",
      application: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Error saving application:", error);
    
    // Check for duplicate applications (optional)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this job"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error saving application"
    });
  }
};

// Get user's application history
export const getApplicationHistory = async (req, res) => {
  const { clerkUserId } = req.params;

  try {
    if (!clerkUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const query = `
      SELECT 
        id,
        job_title,
        company,
        location,
        job_url,
        applied_at,
        created_at
      FROM job_applications
      WHERE clerk_user_id = $1
      ORDER BY applied_at DESC
    `;

    const result = await pool.query(query, [clerkUserId]);

    res.json({
      success: true,
      applications: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error("❌ Error fetching application history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching application history"
    });
  }
};

// Delete application from history
export const deleteApplication = async (req, res) => {
  const { applicationId, clerkUserId } = req.params;

  try {
    if (!applicationId || !clerkUserId) {
      return res.status(400).json({
        success: false,
        message: "Application ID and User ID are required"
      });
    }

    // Delete only if it belongs to the user (security check)
    const query = `
      DELETE FROM job_applications
      WHERE id = $1 AND clerk_user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [applicationId, clerkUserId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found or unauthorized"
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting application:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting application"
    });
  }
};
