
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      navigate(isAuthenticated ? "/dashboard" : "/");
    }
  }, [navigate, isAuthenticated, isLoading]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-background">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-medical-primary animate-spin mb-4" />
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  );
};

export default Index;
