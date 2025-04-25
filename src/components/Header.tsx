
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate("/dashboard")}>
          <div className="bg-medical-primary p-1 rounded">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-medical-dark">Med Report Analyzer</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-medical-primary"
              onClick={() => handleNavigate("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
