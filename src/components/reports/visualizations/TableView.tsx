
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

interface TableViewProps {
  parameterValues: ParameterValue[];
  chartData: ChartDataItem[];
}

const TableView: React.FC<TableViewProps> = ({ parameterValues, chartData }) => {
  return (
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
  );
};

export default TableView;
