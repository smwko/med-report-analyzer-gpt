
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/context/ReportContext";
import Header from "@/components/Header";
import ReportTimeline from "@/components/ReportTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TimelineView = () => {
  const { user } = useAuth();
  const { reports, getUserReports } = useReports();
  const navigate = useNavigate();
  
  // Get reports for the current user
  const userReports = user ? getUserReports(user.id) : [];
  
  const handleBack = () => {
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen bg-medical-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center text-medical-primary" 
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Button>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-medical-primary" />
              <CardTitle>Your Health Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Track your health journey and see how your results have changed over time. View trends, improvements, and areas that may need attention.
            </p>
            
            <ReportTimeline reports={userReports} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TimelineView;
