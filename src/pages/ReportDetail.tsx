
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useReports, Report } from "@/context/ReportContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  ChevronLeft, 
  FileText, 
  Trash2, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Loader2 
} from "lucide-react";
import Header from "@/components/Header";

const ReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports, deleteReport } = useReports();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Find report by ID
  useEffect(() => {
    if (reportId) {
      const foundReport = reports.find((r) => r.id === reportId);
      setReport(foundReport || null);
    }
    setLoading(false);
  }, [reportId, reports]);
  
  // Handle back to dashboard
  const handleBack = () => {
    navigate("/dashboard");
  };
  
  // Handle report delete
  const handleDelete = () => {
    if (report) {
      deleteReport(report.id);
      toast({
        title: "Report deleted",
        description: "The report has been deleted successfully",
      });
      navigate("/dashboard");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-medical-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-medical-primary animate-spin" />
      </div>
    );
  }
  
  if (!report) {
    return (
      <div className="min-h-screen bg-medical-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-4 flex items-center text-medical-primary" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Button>
          
          <Card className="max-w-4xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-12 w-12 text-medical-attention mb-4" />
              <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
              <p className="text-gray-600 mb-6">
                The report you're looking for doesn't exist or has been deleted
              </p>
              <Button onClick={handleBack} className="bg-medical-primary hover:bg-medical-dark">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-medical-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center text-medical-primary" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            className="text-red-500 border-red-200 hover:bg-red-50" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Report
          </Button>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-medical-primary" />
                    <CardTitle>{report.filename}</CardTitle>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      {new Date(report.uploadDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                
                {report.healthStatus === "needsAttention" ? (
                  <div className="flex items-center bg-red-100 text-red-600 px-3 py-1 rounded-full">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Needs Attention</span>
                  </div>
                ) : (
                  <div className="flex items-center bg-green-100 text-green-600 px-3 py-1 rounded-full">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>All Normal</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
          
          {/* Report content */}
          <Card>
            <CardContent className="py-6">
              <div className="markdown prose max-w-none">
                <ReactMarkdown>{report.rawReport}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReportDetail;
