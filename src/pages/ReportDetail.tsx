import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useReports, Report } from "@/context/ReportContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { jsPDF } from "jspdf";

// Common blood test parameters with explanations - now serves as a reference, not a limiter
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

// Reference ranges for common parameters (for visual comparison) - now serves as a reference, not a limiter
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

// Function to calculate normalized value (0-100) based on how far a value is from the reference range
const calculateNormalizedValue = (value: number, min: number, max: number): number => {
  // If value is within range, score is 100
  if (value >= min && value <= max) {
    return 100;
  }

  // Calculate how far the value deviates from the nearest boundary
  const midpoint = (max + min) / 2;
  const range = max - min;
  const deviation = Math.abs(value - midpoint) / range;
  
  // Apply exponential decay to the score based on deviation
  // The further from normal range, the more rapidly the score drops
  let score = 100 * Math.exp(-2 * deviation);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

// Updated parameter extraction function to detect ALL parameters
const extractParameterValues = (reportText: string): { parameter: string; name: string; value: number; unit: string; status: string; referenceRange?: { min: number; max: number } }[] => {
  const results: { parameter: string; name: string; value: number; unit: string; status: string; referenceRange?: { min: number; max: number } }[] = [];
  
  // Get known parameters as a starting point
  const knownParameterKeys = Object.keys(bloodParameterInfo);
  
  const lines = reportText.split('\n');
  
  // Regular expressions for more comprehensive detection
  const parameterPatterns = [
    /([A-Za-z]+(?:[- ][A-Za-z]+)*)\s*[:=]\s*([\d.]+)\s*([a-zA-Z/%µ]*)/i,  // Parameter: 123 unit
    /([A-Za-z]+(?:[- ][A-Za-z]+)*)\s*(?:level|result|value|count)[:=\s]+([\d.]+)\s*([a-zA-Z/%µ]*)/i,  // Parameter level: 123 unit
    /([A-Za-z]+(?:[- ][A-Za-z]+)*)\s+([\d.]+)\s*([a-zA-Z/%µ]*)/i  // Parameter 123 unit
  ];
  
  // Regular expressions for reference ranges
  const refRangePatterns = [
    /reference(?:\s*range)?[:=\s]+([\d.]+)[-–—to]+\s*([\d.]+)/i,  // Reference range: X-Y
    /normal(?:\s*range)?[:=\s]+([\d.]+)[-–—to]+\s*([\d.]+)/i,     // Normal range: X-Y
    /range[:=\s]+([\d.]+)[-–—to]+\s*([\d.]+)/i,                   // Range: X-Y
    /\(([\d.]+)[-–—to]+\s*([\d.]+)\)/i                            // (X-Y)
  ];

  // First, search for table patterns in the report
  const tablePattern = /\|([^|]+)\|([^|]+)\|(?:[^|]+\|)?(?:[^|]+\|)?/g;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(reportText)) !== null) {
    if (tableMatch.length >= 3) {
      const parameterName = tableMatch[1].trim();
      const valueText = tableMatch[2].trim();
      
      // Extract value and unit
      const valueMatch = valueText.match(/([\d.]+)\s*([a-zA-Z/%µ]*)/i);
      if (valueMatch && valueMatch.length >= 2) {
        const value = parseFloat(valueMatch[1]);
        if (!isNaN(value)) {
          const unit = valueMatch[2] || '';
          
          // Normalize the parameter name to create a unique key
          const parameterKey = parameterName.toLowerCase().replace(/[-\s]/g, '_');
          
          // Look for status indicators in the vicinity
          const isHigh = tableMatch[0].toLowerCase().includes('high') || 
                         tableMatch[0].toLowerCase().includes('elevated') ||
                         tableMatch[0].toLowerCase().includes('above');
          const isLow = tableMatch[0].toLowerCase().includes('low') || 
                        tableMatch[0].toLowerCase().includes('decreased') ||
                        tableMatch[0].toLowerCase().includes('below');
          const status = isHigh ? "high" : isLow ? "low" : "normal";
          
          // Look for reference range
          let referenceRange;
          for (const pattern of refRangePatterns) {
            const rangeMatch = tableMatch[0].match(pattern);
            if (rangeMatch && rangeMatch.length >= 3) {
              const min = parseFloat(rangeMatch[1]);
              const max = parseFloat(rangeMatch[2]);
              if (!isNaN(min) && !isNaN(max)) {
                referenceRange = { min, max };
                break;
              }
            }
          }
          
          results.push({
            parameter: parameterKey,
            name: parameterName,
            value,
            unit,
            status,
            referenceRange
          });
        }
      }
    }
  }
  
  // Second, go through each line to find parameters
  lines.forEach(line => {
    // Skip lines that are likely headers or don't contain data
    if (line.trim().length < 5 || /^[-=|]+$/.test(line) || line.split(' ').length < 2) {
      return;
    }
    
    // Try each parameter pattern
    for (const pattern of parameterPatterns) {
      const match = line.match(pattern);
      if (match && match.length >= 3) {
        const parameterName = match[1].trim();
        const value = parseFloat(match[2]);
        
        if (!isNaN(value)) {
          const unit = match[3] ? match[3].trim() : '';
          
          // Normalize the parameter name to create a unique key
          const parameterKey = parameterName.toLowerCase().replace(/[-\s]/g, '_');
          
          // Check if we already found this parameter
          if (results.some(r => r.parameter === parameterKey)) {
            continue;
          }
          
          // Determine status based on text hints
          const lowercaseLine = line.toLowerCase();
          let status = "normal";
          
          if (lowercaseLine.includes('high') || lowercaseLine.includes('elevated') || lowercaseLine.includes('above')) {
            status = "high";
          } else if (lowercaseLine.includes('low') || lowercaseLine.includes('decreased') || lowercaseLine.includes('below')) {
            status = "low";
          }
          
          // Try to find reference range in this line
          let referenceRange;
          for (const rangePattern of refRangePatterns) {
            const rangeMatch = lowercaseLine.match(rangePattern);
            if (rangeMatch && rangeMatch.length >= 3) {
              const min = parseFloat(rangeMatch[1]);
              const max = parseFloat(rangeMatch[2]);
              if (!isNaN(min) && !isNaN(max)) {
                referenceRange = { min, max };
                break;
              }
            }
          }
          
          // If we have a known reference range, use it and update status
          const knownKey = knownParameterKeys.find(key => {
            const info = bloodParameterInfo[key as keyof typeof bloodParameterInfo];
            return info.name.toLowerCase() === parameterName.toLowerCase() || key === parameterKey;
          });
          
          if (knownKey) {
            const knownRange = referenceRanges[knownKey as keyof typeof referenceRanges];
            if (knownRange && !referenceRange) {
              referenceRange = knownRange;
              
              // Update status based on known reference range
              if (value > knownRange.max) {
                status = "high";
              } else if (value < knownRange.min) {
                status = "low";
              } else {
                status = "normal";
              }
            }
          }
          
          // Add to results
          results.push({
            parameter: parameterKey,
            name: parameterName,
            value,
            unit,
            status,
            referenceRange
          });
          
          // Found a match, no need to try other patterns for this line
          break;
        }
      }
    }
  });
  
  // Third, check for well-known parameters by name if they haven't been found yet
  knownParameterKeys.forEach(param => {
    if (!results.find(r => r.parameter === param)) {
      const paramInfo = bloodParameterInfo[param as keyof typeof bloodParameterInfo];
      const searchText = reportText.toLowerCase();
      const nameIndex = searchText.indexOf(paramInfo.name.toLowerCase());
      
      if (nameIndex !== -1) {
        // Found a mention of this parameter, grab the surrounding context
        const contextStart = Math.max(0, nameIndex - 100);
        const contextEnd = Math.min(searchText.length, nameIndex + paramInfo.name.length + 100);
        const context = searchText.slice(contextStart, contextEnd);
        
        // Try to extract value
        for (const pattern of parameterPatterns) {
          const match = context.match(pattern);
          if (match && match.length >= 3) {
            const value = parseFloat(match[2]);
            
            if (!isNaN(value)) {
              const unit = match[3] ? match[3].trim() : '';
              const refRange = referenceRanges[param as keyof typeof referenceRanges];
              
              let status = "normal";
              if (refRange) {
                if (value > refRange.max) status = "high";
                else if (value < refRange.min) status = "low";
              }
              
              results.push({
                parameter: param,
                name: paramInfo.name,
                value,
                unit: unit || (refRange?.unit || ''),
                status,
                referenceRange: refRange
              });
              
              break;
            }
          }
        }
      }
    }
  });
  
  // Sort by name
  return results.sort((a, b) => a.name.localeCompare(b.name));
};

// Updated to use parameter info from extraction
const calculateHealthScore = (paramValues: { parameter: string; name: string; value: number; status: string }[]): number => {
  if (paramValues.length === 0) return 100; // Default perfect score
  
  const abnormalCount = paramValues.filter(p => p.status !== "normal").length;
  const totalCount = paramValues.length;
  
  // Score starts at 100 and decreases based on abnormal parameters
  return Math.max(0, 100 - (abnormalCount / totalCount) * 100);
};

// Function to get parameter description either from known info or generate a generic one
const getParameterDescription = (param: { parameter: string; name: string }): string => {
  const knownKey = Object.keys(bloodParameterInfo).find(key => 
    key === param.parameter || 
    bloodParameterInfo[key as keyof typeof bloodParameterInfo].name.toLowerCase() === param.name.toLowerCase()
  );
  
  if (knownKey) {
    return bloodParameterInfo[knownKey as keyof typeof bloodParameterInfo].description;
  }
  
  // Generate a generic description
  return `${param.name} is a blood test parameter that provides information about your health. Abnormal levels may indicate health issues that should be discussed with your healthcare provider.`;
};

// Update getHealthStatus function to use new scoring
const getHealthStatus = (score: number): { status: string; color: string; icon: React.ReactNode } => {
  if (score >= 85) {
    return { status: "Excellent", color: "#22c55e", icon: <Shield className="h-5 w-5" /> };
  } else if (score >= 70) {
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
  const [parameterValues, setParameterValues] = useState<{ parameter: string; name: string; value: number; unit: string; status: string; referenceRange?: { min: number; max: number } }[]>([]);
  const [healthScore, setHealthScore] = useState(100);
  const [chartViewMode, setChartViewMode] = useState<"bars" | "gauge" | "table">("bars");
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  // Update the download handler to generate PDF with all parameters
  const handleDownload = () => {
    if (!report) return;
    
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
      const status = getHealthStatus(healthScore);
      doc.setFontSize(16);
      doc.text("Health Overview", 20, 50);
      doc.setFontSize(14);
      doc.text(`Health Score: ${Math.round(healthScore)}`, 20, 60);
      doc.text(`Status: ${status.status}`, 20, 70);
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
  
  // Update chart data preparation to include all parameters
  const chartData = parameterValues.map(param => {
    let normalizedValue = 50; // Default to middle if no reference
    
    // If we have a reference range, calculate normalized value
    if (param.referenceRange) {
      normalizedValue = calculateNormalizedValue(param.value, param.referenceRange.min, param.referenceRange.max);
    }
      
    return {
      name: param.name,
      value: param.value,
      unit: param.unit || '',
      status: param.status,
      normalizedValue
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
                        <span className="text-sm text-blue-600">
                          Recommended follow-up: {healthStatusInfo.status === "Needs Attention" ? "1-2 weeks" : healthStatusInfo.status === "Fair" ? "1-2 months" : "3-6 months"}
                        </span>
                      </div>
                    )}
                    
                    {/* Count summary of parameters */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center">
                        <span className="font-medium">{parameterValues.length}</span>
                        <span className="ml-1 text-gray-600">Parameters Found</span>
                      </div>
                      
                      {parameterValues.filter(p => p.status === "high").length > 0 && (
                        <div className="bg-red-50 px-3 py-1 rounded-full text-sm flex items-center text-red-700">
                          <span className="font-medium">{parameterValues.filter(p => p.status === "high").length}</span>
                          <span className="ml-1">High</span>
                        </div>
                      )}
                      
                      {parameterValues.filter(p => p.status === "low").length > 0 && (
                        <div className="bg-blue-50 px-3 py-1 rounded-full text-sm flex items-center text-blue-700">
                          <span className="font-medium">{parameterValues.filter(p => p.status === "low").length}</span>
                          <span className="ml-1">Low</span>
                        </div>
                      )}
                      
                      {parameterValues.filter(p => p.status === "normal").length > 0 && (
                        <div className="bg-green-50 px-3 py-1 rounded-full text-sm flex items-center text-green-700">
                          <span className="font-medium">{parameterValues.filter(p => p.status === "normal").length}</span>
                          <span className="ml-1">Normal</span>
                        </div>
                      )}
                    </div>
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
                      <BarChart3 className="h-4 w-4 mr-1
