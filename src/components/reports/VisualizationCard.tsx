
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "lucide-react";
import { ChartDataItem, ParameterValue } from "@/utils/chartUtils";
import GaugeView from "./visualizations/GaugeView";
import TableView from "./visualizations/TableView";
import ViewToggle from "./visualizations/ViewToggle";

interface VisualizationCardProps {
  chartData: ChartDataItem[];
  parameterValues: ParameterValue[];
}

const VisualizationCard: React.FC<VisualizationCardProps> = ({ chartData, parameterValues }) => {
  const [chartViewMode, setChartViewMode] = useState<"gauge" | "table">("gauge");

  const handleViewChange = (value: "gauge" | "table") => {
    setChartViewMode(value);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-medical-primary" />
            <span>Your Results Visualization</span>
          </CardTitle>
          
          <ViewToggle viewMode={chartViewMode} onViewChange={handleViewChange} />
        </div>
      </CardHeader>
      <CardContent>
        {chartViewMode === "gauge" && <GaugeView chartData={chartData} />}
        {chartViewMode === "table" && <TableView parameterValues={parameterValues} chartData={chartData} />}
      </CardContent>
    </Card>
  );
};

export default VisualizationCard;
