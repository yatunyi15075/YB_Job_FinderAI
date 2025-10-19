import fetch from "node-fetch";

export const getJobs = async (req, res) => {
  const { profession, location } = req.body;

  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;

  try {
    // Validate inputs
    if (!profession || !location) {
      return res.status(400).json({
        success: false,
        message: "Please provide both profession and location",
      });
    }

    // Validate that environment variables exist
    if (!APP_ID || !APP_KEY) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact support.",
      });
    }

    // Fetch from Adzuna
    const COUNTRY = process.env.ADZUNA_COUNTRY || "za";
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&what=${encodeURIComponent(profession)}&where=${encodeURIComponent(location)}&results_per_page=10`
    );

    const data = await response.json();

    // If Adzuna returned an error, handle it
    if (!response.ok || !data.results || !Array.isArray(data.results)) {
      console.error("⚠️ Adzuna API Error:", data);
      return res.status(404).json({
        success: false,
        message: `No jobs found for ${profession} in ${location}. Try different search terms.`,
        jobs: []
      });
    }

    // If no results found
    if (data.results.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No jobs found for ${profession} in ${location}. Try adjusting your search.`,
        jobs: []
      });
    }

    // Process results safely
    const jobs = data.results.slice(0, 10).map((job) => ({
      title: job.title || "Untitled Position",
      company: job.company?.display_name || "Company Not Listed",
      location: job.location?.display_name || location,
      url: job.redirect_url || "#",
    }));

    res.json({ 
      success: true, 
      jobs,
      message: `Found ${jobs.length} jobs`
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error connecting to job service. Please try again later." 
    });
  }
};