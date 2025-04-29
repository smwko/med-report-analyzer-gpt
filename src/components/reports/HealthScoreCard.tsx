
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ThermometerSnowflake, ThermometerSun, AlertCircle, CalendarDays } from "lucide-react";

// Function to determine health status based on score
export const getHealthStatus = (score: number): { status: string; color: string; icon: React.ReactNode } => {
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

interface HealthScoreCardProps {
  healthScore: number;
  parameterValues: Array<{ 
    parameter: string; 
    name: string; 
    value: number; 
    unit: string; 
    status: string; 
    referenceRange?: { min: number; max: number } 
  }>;
}

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ healthScore, parameterValues }) => {
  const healthStatusInfo = getHealthStatus(healthScore);

  return (
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
  );
};

export default HealthScoreCard;
