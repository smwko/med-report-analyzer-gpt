
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Trash2, Clock, AlertCircle, CheckCircle, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Report } from "@/context/ReportContext";
import { jsPDF } from "jspdf";

interface ReportHeaderProps {
  report: Report;
  deleteReport: (id: string) => void;
  healthScore: number;
  parameterValues: Array<{
    parameter: string;
    name: string;
    value: number;
    unit: string;
    status: string;
    referenceRange?: { min: number; max: number };
  }>;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ report, deleteReport, healthScore, parameterValues }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleDelete = () => {
    deleteReport(report.id);
    toast({
      title: "Report deleted",
      description: "The report has been deleted successfully",
    });
    navigate("/dashboard");
  };

  const handleDownload = () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(report.filename, 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date(report.uploadDate).toLocaleDateString()}`, 20, 30);
    
    // Add health score if available
    if (healthScore) {
      doc.setFontSize(16);
      doc.text("Health Overview", 20, 50);
      doc.setFontSize(14);
      doc.text(`Health Score: ${Math.round(healthScore)}`, 20, 60);
      const status = healthScore >= 85 ? "Excellent" : 
                     healthScore >= 70 ? "Good" : 
                     healthScore >= 50 ? "Fair" : 
                     "Needs Attention";
      doc.text(`Status: ${status}`, 20, 70);
    }
    
    // Add parameters section - now includes all parameters
    if (parameterValues.length > 0) {
      doc.setFontSize(16);
      doc.text("Test Results", 20, 90);
      
      let yPos = 100;
      parameterValues.forEach((param) => {
        doc.setFontSize(12);
        doc.text(`${param.name}: ${param.value} ${param.unit || ''}`, 20, yPos);
        doc.text(`Status: ${param.status}`, 120, yPos);
        
        yPos += 10;
        
        // Add page if needed
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
    
    // Save the PDF
    doc.save(`${report.filename.replace(/\.\w+$/, '')}-report.pdf`);
    
    toast({
      title: "Report downloaded",
      description: "Your report has been downloaded as a PDF",
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          className="flex items-center text-medical-primary"
          onClick={handleBack}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </Button>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="text-medical-primary border-medical-light hover:bg-medical-light/20"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
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
      </div>

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
    </>
  );
};

export default ReportHeader;
