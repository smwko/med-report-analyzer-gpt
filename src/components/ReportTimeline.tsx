
import React from "react";
import { Report } from "@/context/ReportContext";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface ReportTimelineProps {
  reports: Report[];
}

interface TimelineEntryProps {
  report: Report;
  previousReport: Report | null;
  onSelect: (reportId: string) => void;
}

const getMonthYearString = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const getDateDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
};

const extractKeyParameters = (reportText: string): { name: string; value: string; status: "high" | "low" | "normal" }[] => {
  const parameters = [];
  const commonParameters = ["glucose", "cholesterol", "hdl", "ldl", "triglycerides", "hba1c"];
  
  // Simple parsing logic - in a real app, you'd want more sophisticated extraction
  const lines = reportText.toLowerCase().split("\n");
  
  for (const param of commonParameters) {
    for (const line of lines) {
      if (line.includes(param)) {
        let status: "high" | "low" | "normal" = "normal";
        if (line.includes("high") || line.includes("elevated")) {
          status = "high";
        } else if (line.includes("low") || line.includes("decreased")) {
          status = "low";
        }
        
        // Extract value - very basic pattern matching
        const valueMatch = line.match(/:\s*([\d.]+)/);
        const value = valueMatch ? valueMatch[1] : "N/A";
        
        parameters.push({
          name: param.charAt(0).toUpperCase() + param.slice(1),
          value,
          status
        });
        
        break;
      }
    }
  }
  
  // Return at most 3 parameters to avoid overcrowding
  return parameters.slice(0, 3);
};

const compareParameters = (current: { name: string; value: string; status: string }[], 
                           previous: { name: string; value: string; status: string }[]): React.ReactNode => {
  if (!previous.length) return null;
  
  // Find matching parameters by name
  const matches = current.filter(curr => 
    previous.some(prev => prev.name === curr.name)
  );
  
  if (!matches.length) return null;
  
  return (
    <div className="mt-2 space-y-1">
      {matches.map(param => {
        const prevParam = previous.find(p => p.name === param.name);
        if (!prevParam) return null;
        
        const currValue = parseFloat(param.value);
        const prevValue = parseFloat(prevParam.value);
        
        if (isNaN(currValue) || isNaN(prevValue)) return null;
        
        const diff = currValue - prevValue;
        const percentDiff = (diff / prevValue) * 100;
        
        let icon = <Minus className="h-4 w-4 text-gray-500" />;
        let textColor = "text-gray-500";
        
        if (diff > 0 && Math.abs(percentDiff) > 5) {
          icon = <TrendingUp className="h-4 w-4 text-red-500" />;
          textColor = "text-red-500";
        } else if (diff < 0 && Math.abs(percentDiff) > 5) {
          icon = <TrendingDown className="h-4 w-4 text-green-500" />;
          textColor = "text-green-500";
        }
        
        return (
          <div key={param.name} className="flex items-center gap-1 text-xs">
            {icon}
            <span className="font-medium">{param.name}:</span>
            <span className={textColor}>
              {diff > 0 ? "+" : ""}{diff.toFixed(1)} ({Math.abs(percentDiff).toFixed(1)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
};

const TimelineEntry: React.FC<TimelineEntryProps> = ({ report, previousReport, onSelect }) => {
  const reportDate = new Date(report.uploadDate);
  const formattedDate = reportDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  
  const keyParams = extractKeyParameters(report.rawReport);
  const prevParams = previousReport ? extractKeyParameters(previousReport.rawReport) : [];
  
  return (
    <div className="mb-6 relative">
      {/* Timeline connector */}
      <div className="absolute top-0 left-4 w-0.5 h-full bg-gray-200 -z-10"></div>
      
      {/* Timeline node */}
      <div className="flex items-start gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 flex-shrink-0 ${report.healthStatus === "needsAttention" ? "bg-red-100" : "bg-green-100"}`}>
          <CalendarDays className={`h-4 w-4 ${report.healthStatus === "needsAttention" ? "text-red-600" : "text-green-600"}`} />
        </div>
        
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{formattedDate}</CardTitle>
                <CardDescription>{report.filename}</CardDescription>
              </div>
              <Badge variant={report.healthStatus === "needsAttention" ? "destructive" : "default"}>
                {report.healthStatus === "needsAttention" ? "Needs Attention" : "Normal"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {/* Key parameters */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {keyParams.map((param, index) => (
                <div key={index} className="text-xs">
                  <span className="font-medium">{param.name}:</span> 
                  <span className={param.status === "high" ? "text-red-600" : param.status === "low" ? "text-blue-600" : "text-gray-600"}>
                    {" "}{param.value}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Changes from previous report */}
            {previousReport && (
              <div className="mt-1 text-xs text-gray-500">
                <p className="font-medium">Changes from {getMonthYearString(previousReport.uploadDate)}:</p>
                {compareParameters(keyParams, prevParams)}
              </div>
            )}
          </CardContent>
          <div className="px-6 py-2 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs flex items-center text-medical-primary"
              onClick={() => onSelect(report.id)}
            >
              View Details <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ReportTimeline: React.FC<ReportTimelineProps> = ({ reports }) => {
  const navigate = useNavigate();
  
  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort((a, b) => 
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );
  
  const handleSelectReport = (reportId: string) => {
    navigate(`/report/${reportId}`);
  };
  
  if (sortedReports.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No reports available to display on the timeline.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="pt-4">
      {sortedReports.map((report, index) => (
        <TimelineEntry 
          key={report.id}
          report={report}
          previousReport={index < sortedReports.length - 1 ? sortedReports[index + 1] : null}
          onSelect={handleSelectReport}
        />
      ))}
    </div>
  );
};

export default ReportTimeline;
