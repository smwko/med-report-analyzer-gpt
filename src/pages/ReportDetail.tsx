
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
  ChevronDown
} from "lucide-react";
import Header from "@/components/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

// Helper function to extract parameter names from the report text
const extractParameters = (reportText: string): string[] => {
  const lowerCaseReport = reportText.toLowerCase();
  return Object.keys(bloodParameterInfo).filter(param => 
    lowerCaseReport.includes(param.toLowerCase())
  );
};

const ReportDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { reports, deleteReport } = useReports();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [relevantParameters, setRelevantParameters] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Find report by ID
  useEffect(() => {
    if (reportId) {
      const foundReport = reports.find((r) => r.id === reportId);
      setReport(foundReport || null);
      
      if (foundReport) {
        // Extract relevant parameters from the report text
        const extractedParams = extractParameters(foundReport.rawReport);
        setRelevantParameters(extractedParams);
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
          <Card className="mb-6">
            <CardContent className="py-6">
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
