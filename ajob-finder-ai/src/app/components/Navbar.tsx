import { useUser, UserButton } from "@clerk/nextjs";
import { Briefcase, LogIn, History } from "lucide-react";

interface NavbarProps {
  onHistoryClick: () => void;
  onAuthClick: () => void;
}

export default function Navbar({ onHistoryClick, onAuthClick }: NavbarProps) {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              JobFinder AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn && (
              <button
                onClick={onHistoryClick}
                className="flex items-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
            )}
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
