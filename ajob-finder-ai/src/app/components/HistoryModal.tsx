import { useState, useEffect, useCallback } from "react";
import { History, XCircle, MapPin, Trash2 } from "lucide-react";

interface Application {
  id: string;
  job_title: string;
  company: string;
  location: string;
  job_url: string;
  applied_at: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  showToast: (message: string, type: "info" | "success" | "error") => void;
}

export default function HistoryModal({ isOpen, onClose, userId, showToast }: HistoryModalProps) {
  const [applicationHistory, setApplicationHistory] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`https://yb-job-finderai-1.onrender.com/api/applications/history/${userId}`);
      const data = await res.json();

      if (data.success) {
        setApplicationHistory(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      showToast("Failed to load application history", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  const deleteFromHistory = async (applicationId: string) => {
    if (!userId) return;

    try {
      const res = await fetch(
        `https://yb-job-finderai-1.onrender.com/api/applications/history/${userId}/${applicationId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (data.success) {
        showToast("Application removed from history", "success");
        fetchHistory();
      } else {
        showToast("Failed to delete application", "error");
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      showToast("Failed to delete application", "error");
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory();
    }
  }, [isOpen, userId, fetchHistory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full shadow-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6" />
            Application History
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading your history...</p>
          </div>
        ) : applicationHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Start applying to jobs and they&apos;ll appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {applicationHistory.map((app) => (
              <div key={app.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{app.job_title}</h3>
                    <p className="text-gray-700 font-medium">{app.company}</p>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {app.location}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-sm underline"
                    >
                      View Job
                    </a>
                    <button onClick={() => deleteFromHistory(app.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
