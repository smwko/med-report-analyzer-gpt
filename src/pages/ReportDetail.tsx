
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReports, Report } from "@/context/ReportContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";

// Import refactored components
import ReportHeader from "@/components/reports/ReportHeader";
import HealthScoreCard from "@/components/reports/HealthScoreCard";
import VisualizationCard from "@/components/reports/VisualizationCard";
import ParameterAccordion from "@/components/reports/ParameterAccordion";

// Import utility functions
import { 
  bloodParameterInfo, 
  referenceRanges, 
  extractParameterValues, 
  calculateHealthScore, 
  calculateNormalizedValue 
} from "@/utils/reportUtils";

const ReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports, deleteReport } = useReports();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [parameterValues, setParameterValues] = useState<{ parameter: string; name: string; value: number; unit: string; status: string; referenceRange?: { min: number; max: number } }[]>([]);
  const [healthScore, setHealthScore] = useState(100);
  const navigate = useNavigate();
  
  // Find report by ID
  useEffect(() => {
    if (reportId) {
      const foundReport = reports.find((r) => r.id === reportId);
      setReport(foundReport || null);
      
      if (foundReport) {
        console.log("Found report:", foundReport);
        
        // Extract parameter values for visualization using our enhanced extractor
        const extractedValues = extractParameterValues(foundReport.rawReport);
        setParameterValues(extractedValues);
        console.log("Extracted values:", extractedValues);
        
        // Calculate health score
        const score = calculateHealthScore(extractedValues);
        setHealthScore(score);
      }
    }
    setLoading(false);
  }, [reportId, reports]);
  
  // Update chart data preparation to include all parameters
  const chartData = parameterValues.map(param => {
    let normalizedValue = 50; // Default to middle if no reference
    
    // If we have a reference range, calculate normalized value
    if (param.referenceRange) {
      normalizedValue = calculateNormalizedValue(
        param.value, 
        param.referenceRange.min, 
        param.referenceRange.max
      );
    } else {
      // If no reference range but we know status, estimate normalized value
      if (param.status === "normal") {
        normalizedValue = 95; // Nearly perfect for normal values
      } else if (param.status === "high") {
        normalizedValue = 30; // Lower score for high values
      } else if (param.status === "low") {
        normalizedValue = 40; // Slightly better score for low values
      }
    }
      
    return {
      name: param.name,
      value: param.value,
      unit: param.unit || '',
      status: param.status,
      normalizedValue
    };
  });
  
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
            onClick={() => navigate("/dashboard")}
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
              <Button onClick={() => navigate("/dashboard")} className="bg-medical-primary hover:bg-medical-dark">
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
        <div className="max-w-4xl mx-auto">
          {/* Report header */}
          <ReportHeader 
            report={report} 
            deleteReport={deleteReport}
            healthScore={healthScore}
            parameterValues={parameterValues}
          />
          
          {/* Health Score Card */}
          {parameterValues.length > 0 && (
            <HealthScoreCard 
              healthScore={healthScore}
              parameterValues={parameterValues}
            />
          )}
          
          {/* Visualizations Card */}
          {parameterValues.length > 0 && (
            <VisualizationCard 
              chartData={chartData}
              parameterValues={parameterValues}
            />
          )}
          
          {/* Raw Report and Parameter Details */}
          <ParameterAccordion 
            report={report}
            parameterValues={parameterValues}
            bloodParameterInfo={bloodParameterInfo}
          />
        </div>
      </main>
    </div>
  );
};

export default ReportDetail;
