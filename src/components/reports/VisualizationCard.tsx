
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Gauge, LineChart } from "lucide-react";
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
  Cell,
} from "recharts";

// Utility function to get bar color based on status
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

interface ParameterValue {
  parameter: string;
  name: string;
  value: number;
  unit: string;
  status: string;
  referenceRange?: { min: number; max: number };
}

interface VisualizationCardProps {
  chartData: ChartDataItem[];
  parameterValues: ParameterValue[];
}

const VisualizationCard: React.FC<VisualizationCardProps> = ({ chartData, parameterValues }) => {
  const [chartViewMode, setChartViewMode] = useState<"bars" | "gauge" | "table">("bars");

  return (
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
              Bars
            </Button>
            <Button 
              variant={chartViewMode === "gauge" ? "default" : "outline"} 
              size="sm"
              onClick={() => setChartViewMode("gauge")}
              className="flex items-center"
            >
              <Gauge className="h-4 w-4 mr-1" />
              Gauge
            </Button>
            <Button 
              variant={chartViewMode === "table" ? "default" : "outline"} 
              size="sm"
              onClick={() => setChartViewMode("table")}
              className="flex items-center"
            >
              <LineChart className="h-4 w-4 mr-1" />
              Table
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartViewMode === "bars" && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow-md">
                          <p className="font-semibold">{data.name}</p>
                          <p>Value: {data.value} {data.unit}</p>
                          <p>Status: {data.status}</p>
                          <p>Health Score: {Math.round(data.normalizedValue)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="normalizedValue">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartViewMode === "gauge" && (
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
        )}

        {chartViewMode === "table" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Reference Range</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parameterValues.map((param, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{param.name}</TableCell>
                    <TableCell>
                      {param.value} {param.unit}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          param.status === "high"
                            ? "bg-red-100 text-red-800"
                            : param.status === "low"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {param.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {Math.round(chartData[i]?.normalizedValue || 50)}
                    </TableCell>
                    <TableCell>
                      {param.referenceRange
                        ? `${param.referenceRange.min}-${param.referenceRange.max} ${param.unit}`
                        : "Not available"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualizationCard;
