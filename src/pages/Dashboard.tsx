
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReports, Report } from "@/context/ReportContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, FileText, Clock, AlertCircle, CheckCircle, Loader2, User, LogOut, Upload } from "lucide-react";
import Header from "@/components/Header";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { reports, isLoading, uploadReport, getUserReports } = useReports();
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get reports for the current user
  const userReports = user ? getUserReports(user.id) : [];
  
  // Filter reports by status
  const normalReports = userReports.filter(report => report.healthStatus === "normal");
  const attentionReports = userReports.filter(report => report.healthStatus === "needsAttention");
  
  // Latest report
  const latestReport = userReports.length > 0 ? userReports[0] : null;
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/heic", "application/pdf"];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, HEIC, or PDF file",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const report = await uploadReport(file);
      
      if (report) {
        toast({
          title: "Report uploaded successfully",
          description: "Your medical report has been analyzed",
        });
        navigate(`/report/${report.id}`);
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to upload and analyze your report",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      // Reset input value so the same file can be uploaded again
      e.target.value = "";
    }
  };
  
  // Handle report click
  const handleReportClick = (report: Report) => {
    navigate(`/report/${report.id}`);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-medical-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Welcome section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {user?.username}
            </h1>
            <p className="text-gray-600">
              Manage and analyze your medical reports
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
        
        {/* Upload card */}
        <Card className="mb-6 border-dashed border-2 border-medical-light">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 bg-blue-100 p-3 rounded-full">
              <PlusCircle className="h-6 w-6 text-medical-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Upload New Report</h2>
            <p className="text-gray-600 mb-4 text-center max-w-md">
              Upload a blood test report as JPG, PNG, HEIC, or PDF to get an AI-powered analysis
            </p>
            <div>
              <Button 
                className="bg-medical-primary hover:bg-medical-dark" 
                disabled={uploading}
                onClick={triggerFileUpload}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Select File to Upload
                  </>
                )}
              </Button>
              <input 
                ref={fileInputRef}
                id="file-upload"
                type="file" 
                accept="image/jpeg,image/png,image/heic,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Dashboard overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total reports */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-medical-primary" />
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-bold">{userReports.length}</p>
              <p className="text-sm text-gray-500">Reports uploaded</p>
            </CardContent>
          </Card>
          
          {/* Normal reports */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-medical-normal" />
                Normal Results
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-bold">{normalReports.length}</p>
              <p className="text-sm text-gray-500">Reports with normal values</p>
            </CardContent>
          </Card>
          
          {/* Reports needing attention */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-medical-attention" />
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-bold">{attentionReports.length}</p>
              <p className="text-sm text-gray-500">Reports with values needing attention</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent reports */}
        <h2 className="text-xl font-bold mb-4">Your Reports</h2>
        
        {userReports.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No reports yet</h3>
              <p className="text-gray-500 text-center max-w-md mb-4">
                Upload your first blood test report to get started with AI-powered analysis
              </p>
              <Button 
                className="bg-medical-primary hover:bg-medical-dark"
                onClick={triggerFileUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload First Report
              </Button>
              <input 
                ref={fileInputRef}
                id="first-file-upload"
                type="file" 
                accept="image/jpeg,image/png,image/heic,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userReports.map((report) => (
              <Card 
                key={report.id} 
                className={`hover:shadow-md cursor-pointer transition-all ${
                  report.healthStatus === "needsAttention" 
                    ? "border-l-4 border-l-medical-attention" 
                    : "border-l-4 border-l-medical-normal"
                }`}
                onClick={() => handleReportClick(report)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex justify-between">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-medical-primary" />
                      <span className="truncate max-w-[150px]">{report.filename}</span>
                    </div>
                    {report.healthStatus === "needsAttention" ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">Needs Attention</span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">Normal</span>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(report.uploadDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {report.rawReport.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
