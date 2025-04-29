
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileText, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Report } from "@/context/ReportContext";

// Function to get parameter description
const getParameterDescription = (param: { parameter: string; name: string }, bloodParameterInfo: any): string => {
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

interface ParameterAccordionProps {
  report: Report;
  parameterValues: Array<{
    parameter: string;
    name: string;
    value: number;
    unit: string;
    status: string;
    referenceRange?: { min: number; max: number };
  }>;
  bloodParameterInfo: Record<string, { name: string; description: string }>;
}

const ParameterAccordion: React.FC<ParameterAccordionProps> = ({
  report,
  parameterValues,
  bloodParameterInfo,
}) => {
  return (
    <Card>
      <CardHeader className="flex items-center">
        <FileText className="h-5 w-5 mr-2 text-medical-primary" />
        <span>Report Details</span>
      </CardHeader>
      <CardContent className="prose max-w-none">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="raw-report">
            <AccordionTrigger className="text-md font-medium">
              View Full Report
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="prose prose-sm max-w-none">
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {report.rawReport}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {parameterValues.length > 0 && (
            <AccordionItem value="parameters-details">
              <AccordionTrigger className="text-md font-medium">
                Parameter Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {parameterValues.map((param, i) => (
                    <Card key={i} className="bg-gray-50 border-gray-200">
                      <CardHeader className="py-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-medium flex items-center">
                            {param.name}
                            <span
                              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                param.status === "high"
                                  ? "bg-red-100 text-red-800"
                                  : param.status === "low"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {param.status}
                            </span>
                          </h4>
                          <div className="font-semibold">
                            {param.value} {param.unit}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 text-sm">
                        <p>{getParameterDescription(param, bloodParameterInfo)}</p>
                        {param.referenceRange && (
                          <div className="mt-2 flex items-center">
                            <Info className="h-4 w-4 mr-1 text-medical-primary" />
                            <span>
                              Normal range: {param.referenceRange.min}-{param.referenceRange.max} {param.unit}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ParameterAccordion;
