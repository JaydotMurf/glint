import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MotionProvider } from "@/contexts/MotionContext";
import { SkipToContent } from "@/components/SkipToContent";
import { MobileNav } from "@/components/MobileNav";
import { StreakMilestoneModal } from "@/components/StreakMilestoneModal";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import LibraryPage from "./pages/LibraryPage";
import UpgradePage from "./pages/UpgradePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MotionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <SkipToContent />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/upgrade" element={<UpgradePage />} />
              
              {/* Protected routes (require auth for saving) */}
              <Route 
                path="/library" 
                element={
                  <ProtectedRoute>
                    <LibraryPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileNav />
            <StreakMilestoneModal />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </MotionProvider>
  </QueryClientProvider>
);

export default App;
