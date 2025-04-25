
import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

// Define report interface
export interface Report {
  id: string;
  userId: string;
  filename: string;
  uploadDate: string;
  rawReport: string;
  healthStatus: "normal" | "needsAttention" | "pending";
  fileType: "pdf" | "image";
}

// Define context shape
interface ReportContextType {
  reports: Report[];
  currentReport: Report | null;
  setCurrentReport: (report: Report | null) => void;
  addReport: (report: Report) => void;
  isLoading: boolean;
  uploadReport: (file: File) => Promise<Report | null>;
  deleteReport: (reportId: string) => void;
  getUserReports: (userId: string) => Report[];
}

// Create the context with a default value
const ReportContext = createContext<ReportContextType | undefined>(undefined);

// Local storage key
const STORAGE_KEY = "med-report-analyzer-reports";

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Load reports from local storage on mount
  useEffect(() => {
    const storedReports = localStorage.getItem(STORAGE_KEY);
    if (storedReports) {
      try {
        setReports(JSON.parse(storedReports));
      } catch (error) {
        console.error("Failed to parse stored reports", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save reports to local storage when they change
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    }
  }, [reports]);

  // Helper function to get reports for a specific user
  const getUserReports = (userId: string): Report[] => {
    return reports.filter(report => report.userId === userId);
  };

  // Add a new report
  const addReport = (report: Report) => {
    setReports(prev => [report, ...prev]);
    setCurrentReport(report);
  };

  // Delete a report
  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    if (currentReport && currentReport.id === reportId) {
      setCurrentReport(null);
    }
  };

  // Helper to determine if a report needs attention
  const determineHealthStatus = (rawReport: string): "normal" | "needsAttention" => {
    // Check for words that might indicate issues
    const attentionIndicators = [
      "high", "low", "elevated", "decreased", 
      "abnormal", "attention", "concerning",
      "critical", "urgent", "warning"
    ];
    
    const lowercaseReport = rawReport.toLowerCase();
    
    for (const indicator of attentionIndicators) {
      if (lowercaseReport.includes(indicator)) {
        return "needsAttention";
      }
    }
    
    return "normal";
  };

  // Upload a report to the API
  const uploadReport = async (file: File): Promise<Report | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
      // Convert the file to base64
      const fileBase64 = await fileToBase64(file);
      
      // Determine file type
      const fileType = file.type.includes("pdf") ? "pdf" : "image";
      const filename = file.name;
      
      // Construct the prompt for AIML API
      const prompt = `Attached is my blood test report. Please interpret it. ${filename}`;
      
      // Prepare the request payload
      const messages = [
        {
          role: "system",
          content: "You are a medical assistant. When a user uploads a blood test, return a full markdown-formatted report including:\n\n1. A list of blood test parameters with values, units, status (normal/high/etc.), and reference ranges.\n2. A short observation section explaining any abnormalities.\n3. Health recommendations organized by goal (e.g., manage blood sugar, lower cholesterol).\n4. A final summary of the user's overall health status.\n\nUse a clean, friendly tone. Use emojis sparingly to make the message warm and engaging."
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: fileBase64
              }
            }
          ]
        }
      ];
      
      // Send request to AIML API
      const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer f8a14b47c9d44fd4a3f88ab8ae24fed8`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: messages,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const rawReport = data.choices[0].message.content;
      
      // Create new report object
      const newReport: Report = {
        id: `report-${Date.now()}`,
        userId: user.id,
        filename,
        uploadDate: new Date().toISOString(),
        rawReport,
        healthStatus: determineHealthStatus(rawReport),
        fileType
      };
      
      addReport(newReport);
      return newReport;
    } catch (error) {
      console.error("Error uploading report", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        currentReport,
        setCurrentReport,
        addReport,
        isLoading,
        uploadReport,
        deleteReport,
        getUserReports
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

// Custom hook to use the report context
export const useReports = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportProvider");
  }
  return context;
};
