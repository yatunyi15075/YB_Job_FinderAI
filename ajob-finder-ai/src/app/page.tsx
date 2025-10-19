"use client"

import { useState } from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Briefcase, MapPin, Search, LogIn, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Navbar from "./components/Navbar";
import HistoryModal from "./components/HistoryModal";

interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
}

type ToastType = "info" | "success" | "error";

interface ToastData {
  message: string;
  type: ToastType;
}

const Toast = ({ message = "", type = "info", onClose = () => {} }: { message: string; type: ToastType; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />, 
    error: <XCircle className="w-5 h-5" />,
    info: <AlertCircle className="w-5 h-5" />
  };
  
  const colors = {
    success: "bg-green-50 border-green-500 text-green-800",
    error: "bg-red-50 border-red-500 text-red-800",
    info: "bg-blue-50 border-blue-500 text-blue-800"
  };
  
  return (
    <div className={`fixed top-4 right-4 ${colors[type]} border-l-4 p-4 rounded-lg shadow-lg flex items-center gap-3 max-w-md animate-slide-in z-50`}>
      {icons[type]}
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function JobFinderApp() {
  const { isSignedIn, user } = useUser();
  const [profession, setProfession] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const findJobs = async () => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      showToast("Please sign in to search for jobs", "info");
      return;
    }

    if (!profession.trim() || !location.trim()) {
      showToast("Please enter both profession and location", "error");
      return;
    }

    setLoading(true);
    setHasSearched(false);
    
    try {
      const res = await fetch("https://yb-job-finderai-1.onrender.com/api/jobs/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, location }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.message || "Failed to fetch jobs. Please try again.", "error");
        setJobs([]);
      } else if (data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
        showToast(`Found ${data.jobs.length} jobs!`, "success");
      } else {
        setJobs([]);
        showToast(`No jobs found for ${profession} in ${location}. Try different keywords or location.`, "info");
      }
    } catch (error) {
      showToast("Network error. Please check your connection and try again.", "error");
      setJobs([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleApply = async (job: Job) => {
    if (!isSignedIn || !user?.id) {
      showToast("Please sign in to apply", "error");
      return;
    }

    try {
      const res = await fetch("https://yb-job-finderai-1.onrender.com/api/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkUserId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          jobUrl: job.url
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast("Application saved! Redirecting to job...", "success");
        window.open(job.url, '_blank', 'noopener,noreferrer');
      } else {
        showToast(data.message || "Failed to save application", "error");
      }
    } catch (error) {
      console.error("Error saving application:", error);
      showToast("Failed to save application", "error");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      findJobs();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <Navbar 
        onHistoryClick={() => setShowHistory(true)}
        onAuthClick={() => setShowAuthModal(true)}
      />

      {showAuthModal && !isSignedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to JobFinder AI</h2>
              <p className="text-gray-600">Sign in to start your job search journey</p>
            </div>
            
            <SignInButton mode="modal">
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all mb-3">
                Sign In with Clerk
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                Register
              </button>
            </SignUpButton>
            
            <button onClick={() => setShowAuthModal(false)} className="w-full mt-4 text-gray-500 hover:text-gray-700">
              Maybe later
            </button>
          </div>
        </div>
      )}

      <HistoryModal 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        userId={user?.id}
        showToast={showToast}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover thousands of opportunities tailored to your skills and location
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title or keyword"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="City or region"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <button
              onClick={findJobs}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? "Searching..." : "Find Jobs"}
            </button>
          </div>
        </div>

        <div>
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Searching for the best opportunities...</p>
            </div>
          )}
          
          {!loading && jobs.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Found
              </h2>
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-l-4 border-indigo-600">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job?.title || "No title"}</h3>
                        <p className="text-gray-700 font-medium mb-1">{job?.company || "No company"}</p>
                        <p className="text-gray-500 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job?.location || "No location"}
                        </p> 
                      </div>
                      <button
                        onClick={() => handleApply(job)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        Apply Now
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!loading && hasSearched && jobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-6">We couldn&apos;t find any jobs matching your search criteria.</p>
              <p className="text-sm text-gray-500">Try adjusting your search terms or location for better results.</p>
            </div>
          )}

          
          {!loading && !hasSearched && jobs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Job Search</h3>
              <p className="text-gray-600">Enter a job title and location to discover amazing opportunities</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500">© 2025 JobFinder AI. Powered by advanced job matching technology.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}