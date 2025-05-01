
import React from "react";
import { Gauge, LineChart } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";

interface ViewToggleProps {
  viewMode: "gauge" | "table";
  onViewChange: (value: "gauge" | "table") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => {
        if (value) onViewChange(value as "gauge" | "table");
      }}
    >
      <ToggleGroupItem value="gauge" aria-label="Gauge View">
        <Gauge className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Gauge</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table View">
        <LineChart className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Table</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
