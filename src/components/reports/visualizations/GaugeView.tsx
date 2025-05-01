
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Utility function to get color based on status
const getBarColor = (status: string) => {
  switch (status) {
    case "high": return "#ef4444"; // Red for high
    case "low": return "#3b82f6"; // Blue for low
    case "normal": return "#22c55e"; // Green for normal
    default: return "#22c55e";
  }
};

interface ChartDataItem {
  name: string;
  value: number;
  unit: string;
  status: string;
  normalizedValue: number;
}

interface GaugeViewProps {
  chartData: ChartDataItem[];
}

const GaugeView: React.FC<GaugeViewProps> = ({ chartData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {chartData.map((item, index) => (
        <Card key={index} className="relative pt-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2" 
            style={{ backgroundColor: getBarColor(item.status) }} 
          />
          <CardContent className="pt-2">
            <h4 className="font-medium text-center mb-2 truncate" title={item.name}>
              {item.name}
            </h4>
            <div className="flex justify-center mb-2">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center border-4" 
                style={{ borderColor: getBarColor(item.status) }}
              >
                <span className="text-lg font-bold">{Math.round(item.normalizedValue)}</span>
              </div>
            </div>
            <div className="text-center text-sm">
              <div className="font-medium">{item.value} {item.unit}</div>
              <div className="capitalize" style={{ color: getBarColor(item.status) }}>
                {item.status}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GaugeView;
