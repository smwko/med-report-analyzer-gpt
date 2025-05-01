
// Utility function to get color based on status
export const getBarColor = (status: string) => {
  switch (status) {
    case "high": return "#ef4444"; // Red for high
    case "low": return "#3b82f6"; // Blue for low
    case "normal": return "#22c55e"; // Green for normal
    default: return "#22c55e";
  }
};

export interface ChartDataItem {
  name: string;
  value: number;
  unit: string;
  status: string;
  normalizedValue: number;
}

export interface ParameterValue {
  parameter: string;
  name: string;
  value: number;
  unit: string;
  status: string;
  referenceRange?: { min: number; max: number };
}
