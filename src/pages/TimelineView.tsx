import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/context/ReportContext";
import Header from "@/components/Header";
import ReportTimeline from "@/components/ReportTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Clock, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

const TimelineView = () => {
  const { user } = useAuth();
  const { reports, getUserReports } = useReports();
  const navigate = useNavigate();
  
  // Get reports for the current user
  const userReports = user ? getUserReports(user.id) : [];
  
  const handleBack = () => {
    navigate("/dashboard");
  };
  
  // Handle downloading all reports as a PDF file
  const handleDownloadAll = () => {
    if (!userReports || userReports.length === 0) return;
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Health Timeline Report", 20, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
    
    let yPosition = 50;
    
    // Add each report
    userReports.forEach((report, index) => {
      // Add page break if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.text(`${index + 1}. ${report.filename}`, 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(report.uploadDate).toLocaleDateString()}`, 20, yPosition);
      yPosition += 10;
      
      // Split report text into lines to fit page width
      const lines = doc.splitTextToSize(report.rawReport, 170);
      doc.text(lines, 20, yPosition);
      yPosition += 10 * lines.length + 20;
    });
    
    // Save the PDF
    doc.save(`health-timeline-report.pdf`);
  };
  
  return (
    <div className="min-h-screen bg-medical-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="flex items-center text-medical-primary" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Button>
          
          {userReports.length > 0 && (
            <Button 
              variant="outline"
              className="text-medical-primary border-medical-light hover:bg-medical-light/20" 
              onClick={handleDownloadAll}
            >
              <Download className="h-4 w-4 mr-2" />
              Download All Reports
            </Button>
          )}
        </div>
        
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
            
            {userReports.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
                <p className="text-gray-500 mb-4">
                  Upload your first medical report to start tracking your health over time.
                </p>
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-medical-primary hover:bg-medical-dark"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TimelineView;
