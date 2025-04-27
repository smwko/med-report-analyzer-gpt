
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  Loader2,
  Info,
  ChevronDown,
  BarChart3,
  LineChart,
  Gauge,
  Shield,
  ThermometerSnowflake,
  ThermometerSun,
  CalendarDays,
  Download
} from "lucide-react";
import Header from "@/components/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  LabelList
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Common blood test parameters with explanations
const bloodParameterInfo = {
  glucose: {
    name: "Glucose",
    description: "Glucose is a type of sugar and the main source of energy for your body. High levels can indicate diabetes or prediabetes, while low levels (hypoglycemia) might suggest issues with diet, certain medications, or other health conditions."
  },
  cholesterol: {
    name: "Cholesterol",
    description: "Cholesterol is a fatty substance essential for building cells. High total cholesterol increases the risk of heart disease and stroke. It's divided into 'good' cholesterol (HDL) and 'bad' cholesterol (LDL)."
  },
  hdl: {
    name: "HDL Cholesterol",
    description: "High-Density Lipoprotein (HDL) is known as 'good' cholesterol because it helps remove other forms of cholesterol from the bloodstream. Higher levels of HDL are generally better for heart health."
  },
  ldl: {
    name: "LDL Cholesterol",
    description: "Low-Density Lipoprotein (LDL) is known as 'bad' cholesterol because high levels can lead to plaque buildup in the arteries, increasing the risk of heart disease and stroke."
  },
  triglycerides: {
    name: "Triglycerides",
    description: "Triglycerides are a type of fat in the blood. High levels combined with high LDL or low HDL can increase the risk of heart attack and stroke."
  },
  hba1c: {
    name: "HbA1c",
    description: "Hemoglobin A1c measures your average blood sugar levels over the past 2-3 months. It's used to diagnose diabetes and monitor how well diabetes is being managed."
  },
  tsh: {
    name: "TSH",
    description: "Thyroid Stimulating Hormone helps control the thyroid gland. Abnormal levels can indicate an overactive thyroid (hyperthyroidism) or underactive thyroid (hypothyroidism)."
  },
  wbc: {
    name: "White Blood Cell Count",
    description: "White blood cells help fight infection. High counts often indicate infection, inflammation, or sometimes leukemia. Low counts can suggest bone marrow problems or autoimmune disorders."
  },
  rbc: {
    name: "Red Blood Cell Count",
    description: "Red blood cells carry oxygen throughout the body. Low counts may indicate anemia, while high counts can be associated with dehydration or other conditions."
  },
  hemoglobin: {
    name: "Hemoglobin",
    description: "Hemoglobin is the protein in red blood cells that carries oxygen. Low levels can indicate anemia or blood loss, while high levels might suggest lung disease or living at high altitudes."
  },
  creatinine: {
    name: "Creatinine",
    description: "Creatinine is a waste product from normal muscle breakdown. High levels in the blood can indicate kidney problems."
  },
  potassium: {
    name: "Potassium",
    description: "Potassium helps your nerves and muscles function properly. Both high and low levels can affect heart rhythm and muscle function."
  },
  sodium: {
    name: "Sodium",
    description: "Sodium helps maintain fluid balance and is essential for nerve and muscle function. Abnormal levels can indicate dehydration, kidney problems, or hormonal imbalances."
  },
  alt: {
    name: "ALT (Alanine Transaminase)",
    description: "ALT is an enzyme found primarily in the liver. Elevated levels can indicate liver damage from various causes including medications, alcohol, or hepatitis."
  },
  ast: {
    name: "AST (Aspartate Aminotransferase)",
    description: "AST is an enzyme found in the liver, heart, and muscles. Elevated levels can indicate liver damage, heart attack, or muscle injury."
  }
};

// Reference ranges for common parameters (for visual comparison)
const referenceRanges = {
  glucose: { min: 70, max: 100, unit: "mg/dL" },
  cholesterol: { min: 125, max: 200, unit: "mg/dL" },
  hdl: { min: 40, max: 60, unit: "mg/dL" },
  ldl: { min: 0, max: 100, unit: "mg/dL" },
  triglycerides: { min: 0, max: 150, unit: "mg/dL" },
  hba1c: { min: 4.0, max: 5.6, unit: "%" },
  tsh: { min: 0.4, max: 4.0, unit: "mIU/L" },
  wbc: { min: 4.5, max: 11.0, unit: "10³/μL" },
  rbc: { min: 4.5, max: 5.9, unit: "10⁶/μL" },
  hemoglobin: { min: 13.5, max: 17.5, unit: "g/dL" },
  creatinine: { min: 0.6, max: 1.2, unit: "mg/dL" },
  potassium: { min: 3.5, max: 5.0, unit: "mmol/L" },
  sodium: { min: 135, max: 145, unit: "mmol/L" },
  alt: { min: 7, max: 56, unit: "U/L" },
  ast: { min: 10, max: 40, unit: "U/L" }
};

// Helper function to extract parameter names from the report text
const extractParameters = (reportText: string): string[] => {
  const lowerCaseReport = reportText.toLowerCase();
  return Object.keys(bloodParameterInfo).filter(param => 
    lowerCaseReport.includes(param.toLowerCase())
  );
};

// Improved helper function to extract numerical values from the report text
const extractParameterValues = (reportText: string): { parameter: string; value: number; status: string }[] => {
  const results: { parameter: string; value: number; status: string }[] = [];
  const parameterKeys = Object.keys(bloodParameterInfo);
  
  // Split the report into lines for easier processing
  const lines = reportText.split('\n');
  
  // First try to find values in table format (most common in markdown)
  // Look for the pattern | Parameter | Value | Status | or similar
  let inTable = false;
  let headerRow: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Check if we've entered a table (line contains multiple | characters)
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|') && (trimmedLine.match(/\|/g) || []).length >= 3) {
      if (!inTable) {
        // This might be the header row
        inTable = true;
        headerRow = trimmedLine
          .split('|')
          .map(cell => cell.trim().toLowerCase())
          .filter(cell => cell !== '');
        
        continue;
      }
      
      // Skip separator row with dashes
      if (trimmedLine.includes('---')) continue;
      
      // This is a data row
      const cells = trimmedLine
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell !== '');
      
      if (cells.length >= 2) {
        // Find which column has the parameter name and value
        const paramColIndex = headerRow.findIndex(h => 
          h.includes('parameter') || h.includes('test') || h.includes('name')
        );
        const valueColIndex = headerRow.findIndex(h => 
          h.includes('value') || h.includes('result')
        );
        const statusColIndex = headerRow.findIndex(h => 
          h.includes('status') || h.includes('range') || h.includes('flag')
        );
        
        if (paramColIndex !== -1 && valueColIndex !== -1 && paramColIndex < cells.length && valueColIndex < cells.length) {
          const paramName = cells[paramColIndex].toLowerCase();
          const valueText = cells[valueColIndex];
          const valueMatch = valueText.match(/(\d+\.?\d*)/);
          
          if (valueMatch) {
            const value = parseFloat(valueMatch[0]);
            
            // Determine status
            let status = "normal";
            if (statusColIndex !== -1 && statusColIndex < cells.length) {
              const statusText = cells[statusColIndex].toLowerCase();
              if (statusText.includes('high') || statusText.includes('elevated') || statusText.includes('above')) {
                status = "high";
              } else if (statusText.includes('low') || statusText.includes('below')) {
                status = "low";
              }
            }
            
            // Find matching parameter
            for (const param of parameterKeys) {
              if (paramName.includes(param.toLowerCase()) || 
                  paramName.includes(bloodParameterInfo[param as keyof typeof bloodParameterInfo].name.toLowerCase())) {
                results.push({ parameter: param, value, status });
                break;
              }
            }
          }
        }
      }
    } else if (inTable) {
      // We've left the table
      inTable = false;
    }
  }
  
  // If table processing didn't produce results, try line-by-line parsing
  if (results.length === 0) {
    for (const line of lines) {
      // Look for common patterns like "Glucose: 105 mg/dL (HIGH)"
      for (const param of parameterKeys) {
        const paramName = bloodParameterInfo[param as keyof typeof bloodParameterInfo].name;
        
        if (line.toLowerCase().includes(paramName.toLowerCase()) || line.toLowerCase().includes(param.toLowerCase())) {
          // Look for a numeric value
          const valueMatch = line.match(/[:\s]([\d.]+)/);
          
          if (valueMatch && valueMatch[1]) {
            const value = parseFloat(valueMatch[1]);
            
            // Determine status
            let status = "normal";
            const lowerCaseLine = line.toLowerCase();
            if (lowerCaseLine.includes('high') || lowerCaseLine.includes('elevated') || lowerCaseLine.includes('abnormal')) {
              status = "high";
            } else if (lowerCaseLine.includes('low') || lowerCaseLine.includes('decreased')) {
              status = "low";
            }
            
            results.push({ parameter: param, value, status });
            break;
          }
        }
      }
    }
  }
  
  // If still no results, try even more aggressive pattern matching
  if (results.length === 0) {
    for (const param of parameterKeys) {
      const paramName = bloodParameterInfo[param as keyof typeof bloodParameterInfo].name.toLowerCase();
      const paramRegex = new RegExp(`${paramName}[^\\d]+(\\d+\\.?\\d*)`, 'i');
      const match = reportText.match(paramRegex);
      
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        let status = "normal";
        
        // Check nearby text for status indicators
        const contextStart = Math.max(0, match.index! - 20);
        const contextEnd = Math.min(reportText.length, match.index! + match[0].length + 20);
        const context = reportText.substring(contextStart, contextEnd).toLowerCase();
        
        if (context.includes('high') || context.includes('elevated') || context.includes('abnormal')) {
          status = "high";
        } else if (context.includes('low') || context.includes('decreased')) {
          status = "low";
        }
        
        results.push({ parameter: param, value, status });
      }
    }
  }
  
  console.log("Extracted parameter values:", results);
  return results;
};

// Calculate an overall health score based on parameter values
const calculateHealthScore = (paramValues: { parameter: string; value: number; status: string }[]): number => {
  if (paramValues.length === 0) return 100; // Default perfect score
  
  const abnormalCount = paramValues.filter(p => p.status !== "normal").length;
  const totalCount = paramValues.length;
  
  // Score starts at 100 and decreases based on abnormal parameters
  return Math.max(0, 100 - (abnormalCount / totalCount) * 100);
};

// Get health status based on the health score
const getHealthStatus = (score: number): { status: string; color: string; icon: React.ReactNode } => {
  if (score >= 90) {
    return { status: "Excellent", color: "#22c55e", icon: <Shield className="h-5 w-5" /> };
  } else if (score >= 75) {
    return { status: "Good", color: "#84cc16", icon: <ThermometerSnowflake className="h-5 w-5" /> };
  } else if (score >= 50) {
    return { status: "Fair", color: "#eab308", icon: <ThermometerSun className="h-5 w-5" /> };
  } else {
    return { status: "Needs Attention", color: "#ef4444", icon: <AlertCircle className="h-5 w-5" /> };
  }
};

const ReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports, deleteReport } = useReports();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [relevantParameters, setRelevantParameters] = useState<string[]>([]);
  const [parameterValues, setParameterValues] = useState<{ parameter: string; value: number; status: string }[]>([]);
  const [healthScore, setHealthScore] = useState(100);
  const [chartViewMode, setChartViewMode] = useState<"bars" | "gauge">("bars");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Find report by ID
  useEffect(() => {
    if (reportId) {
      const foundReport = reports.find((r) => r.id === reportId);
      setReport(foundReport || null);
      
      if (foundReport) {
        console.log("Found report:", foundReport);
        
        // Extract relevant parameters from the report text
        const extractedParams = extractParameters(foundReport.rawReport);
        setRelevantParameters(extractedParams);
        console.log("Extracted parameters:", extractedParams);
        
        // Extract parameter values for visualization
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
  
  // Handle report download
  const handleDownload = () => {
    if (!report) return;
    
    // Create the file content from report data
    const content = `# ${report.filename}
## Uploaded on ${new Date(report.uploadDate).toLocaleDateString()}

${report.rawReport}

---
Generated by Medical Reports Analyzer
`;
    
    // Create a Blob with the content
    const blob = new Blob([content], { type: 'text/markdown' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.filename.replace(/\.\w+$/, '')}-report.md`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: "Report downloaded",
      description: "Your report has been downloaded successfully",
    });
  };
  
  // Prepare chart data
  const chartData = parameterValues.map(param => {
    const refRange = referenceRanges[param.parameter as keyof typeof referenceRanges];
    const normalizedValue = refRange ? 
      ((param.value - refRange.min) / (refRange.max - refRange.min)) * 100 : 
      50; // Default to middle if no reference
      
    return {
      name: bloodParameterInfo[param.parameter as keyof typeof bloodParameterInfo]?.name || param.parameter,
      value: param.value,
      status: param.status,
      normalizedValue: Math.min(Math.max(normalizedValue, 0), 100) // Keep between 0-100
    };
  });
  
  // Get health status information
  const healthStatusInfo = getHealthStatus(healthScore);
  
  // Custom bar colors based on status
  const getBarColor = (status: string) => {
    switch (status) {
      case "high": return "#ef4444"; // Red for high
      case "low": return "#3b82f6"; // Blue for low
      case "normal": return "#22c55e"; // Green for normal
      default: return "#22c55e";
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
        
        <div className="max-w-4xl mx-auto">
          {/* Report header */}
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
          
          {/* Health Score Card */}
          {parameterValues.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {healthStatusInfo.icon}
                  <span className="ml-2">Health Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  {/* Health Score */}
                  <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center relative" style={{ borderColor: healthStatusInfo.color }}>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{Math.round(healthScore)}</div>
                      <div className="text-xs text-gray-500">Health Score</div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: healthStatusInfo.color }}>
                      {healthStatusInfo.status}
                    </h3>
                    <p className="text-gray-600">
                      {healthStatusInfo.status === "Excellent" ? (
                        "Your results are looking great! All parameters are within optimal ranges."
                      ) : healthStatusInfo.status === "Good" ? (
                        "Your results are good overall with just a few parameters to keep an eye on."
                      ) : healthStatusInfo.status === "Fair" ? (
                        "Some important parameters need attention. Consider discussing with your healthcare provider."
                      ) : (
                        "Several key parameters are outside normal ranges. We recommend consulting with your healthcare provider soon."
                      )}
                    </p>
                    
                    {healthStatusInfo.status !== "Excellent" && (
                      <div className="mt-2 flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1 text-blue-500" />
                        <span className="text-sm text-blue-600">Recommended follow-up: {healthStatusInfo.status === "Needs Attention" ? "1-2 weeks" : healthStatusInfo.status === "Fair" ? "1-2 months" : "3-6 months"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Visualizations Card */}
          {parameterValues.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-medical-primary" />
                    <span>Your Results Visualization</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={chartViewMode === "bars" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setChartViewMode("bars")}
                      className="flex items-center"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Bar View
                    </Button>
                    <Button 
                      variant={chartViewMode === "gauge" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setChartViewMode("gauge")}
                      className="flex items-center"
                    >
                      <Gauge className="h-4 w-4 mr-1" />
                      Gauge View
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {chartViewMode === "bars" ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        layout="vertical"
                      >
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const refRange = referenceRanges[
                                Object.keys(bloodParameterInfo).find(
                                  key => bloodParameterInfo[key as keyof typeof bloodParameterInfo].name === data.name
                                ) as keyof typeof referenceRanges
                              ];
                              
                              return (
                                <div className="bg-white p-3 border rounded shadow-md">
                                  <p className="font-medium">{data.name}</p>
                                  <p>Value: <span className="font-semibold">{data.value}</span> {refRange?.unit}</p>
                                  {refRange && (
                                    <p className="text-gray-600 text-xs">
                                      Normal range: {refRange.min}-{refRange.max} {refRange.unit}
                                    </p>
                                  )}
                                  <p className="capitalize mt-1" style={{ 
                                    color: data.status === "high" ? "#ef4444" : 
                                           data.status === "low" ? "#3b82f6" : "#22c55e" 
                                  }}>
                                    Status: {data.status}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="value" minPointSize={2}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                          ))}
                          <LabelList 
                            dataKey="value" 
                            position="right" 
                            style={{ textAnchor: 'start', fontSize: '12px', fill: '#666' }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {chartData.map((param, index) => (
                      <div 
                        key={index}
                        className="border rounded-lg p-4 flex flex-col items-center"
                      >
                        <div className="text-sm font-medium mb-2">{param.name}</div>
                        <div 
                          className="w-24 h-24 rounded-full border-8 flex items-center justify-center"
                          style={{ borderColor: getBarColor(param.status) }}
                        >
                          <div className="text-center">
                            <div className="text-xl font-bold">{param.value}</div>
                            <div className="text-xs text-gray-500">
                              {referenceRanges[
                                Object.keys(bloodParameterInfo).find(
                                  key => bloodParameterInfo[key as keyof typeof bloodParameterInfo].name === param.name
                                ) as keyof typeof referenceRanges
                              ]?.unit || ''}
                            </div>
                          </div>
                        </div>
                        <div 
                          className="mt-2 text-sm font-medium capitalize"
                          style={{ color: getBarColor(param.status) }}
                        >
                          {param.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-red-500 rounded-full mr-1"></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-blue-500 rounded-full mr-1"></div>
                      <span>Low</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 bg-green-500 rounded-full mr-1"></div>
                      <span>Normal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Report content */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Report Details</CardTitle>
              <Button 
                variant="outline"
                size="sm" 
                className="text-medical-primary border-medical-light hover:bg-medical-light/20" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </CardHeader>
            <CardContent className="py-4">
              <div className="markdown prose max-w-none">
                {/* Use remarkGfm plugin to properly render tables */}
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {report.rawReport}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
          
          {/* Understand Your Results Section */}
          {relevantParameters.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-medical-primary" />
                  Understand Your Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Learn more about the key measurements in your blood test and what they mean for your health.
                </p>
                
                <Accordion type="single" collapsible className="w-full">
                  {relevantParameters.map((param) => (
                    <AccordionItem value={param} key={param}>
                      <AccordionTrigger className="text-left font-medium">
                        What is {bloodParameterInfo[param as keyof typeof bloodParameterInfo]?.name}?
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-700">
                          {bloodParameterInfo[param as keyof typeof bloodParameterInfo]?.description}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                
                {relevantParameters.length < 3 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-800 mb-2">Other Common Blood Test Measurements</h4>
                    <Accordion type="single" collapsible className="w-full">
                      {Object.keys(bloodParameterInfo)
                        .filter(param => !relevantParameters.includes(param))
                        .slice(0, 5)
                        .map((param) => (
                          <AccordionItem value={param} key={param}>
                            <AccordionTrigger className="text-left font-medium">
                              What is {bloodParameterInfo[param as keyof typeof bloodParameterInfo]?.name}?
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="text-gray-700">
                                {bloodParameterInfo[param as keyof typeof bloodParameterInfo]?.description}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      }
                    </Accordion>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportDetail;
