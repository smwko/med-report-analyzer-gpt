
// Common blood test parameters with explanations
export const bloodParameterInfo = {
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

// Reference ranges for common parameters
export const referenceRanges = {
  glucose: { min: 70, max: 100, unit: "mg/dL" },
  cholesterol: { min: 125, max: 200, unit: "mg/dL" },
  hdl: { min: 40, max: 60, unit: "mg/dL" },
  ldl: { min: 0, max: 100, unit: "mg/dL" },
  triglycerides: { min: 0, max: 150, unit: "mg/dL" },
  hba1c: { min: 4.0, max: 5.6, unit: "%" },
  tsh: { min: 0.4, max: 4.0, unit: "mIU/L" },
  wbc: { min: 4.5, max: 11.0, unit: "10³/μL" },
  rbc: { min: 4.5, max: 5.9, unit: "10⁶/μL" },
  hemoglobin: { min: 13.5, max: 17.5, unit: "g/dL" },
  creatinine: { min: 0.6, max: 1.2, unit: "mg/dL" },
  potassium: { min: 3.5, max: 5.0, unit: "mmol/L" },
  sodium: { min: 135, max: 145, unit: "mmol/L" },
  alt: { min: 7, max: 56, unit: "U/L" },
  ast: { min: 10, max: 40, unit: "U/L" }
};

// Function to calculate normalized value (0-100) based on how far a value is from the reference range
export const calculateNormalizedValue = (value: number, min: number, max: number): number => {
  // If value is within range, score is 100
  if (value >= min && value <= max) {
    return 100;
  }

  // Calculate how far the value deviates from the nearest boundary
  const rangeWidth = max - min;
  
  // Find the closest boundary
  const closestBoundary = value < min ? min : max;
  
  // Calculate distance from boundary as percentage of the range
  const deviation = Math.abs(value - closestBoundary) / rangeWidth;
  
  // Apply exponential decay to the score based on deviation
  // The further from normal range, the more rapidly the score drops
  const score = 100 * Math.exp(-3 * deviation);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

// Parameter extraction function to detect ALL parameters
export const extractParameterValues = (reportText: string): { parameter: string; name: string; value: number; unit: string; status: string; referenceRange?: { min: number; max: number } }[] => {
  const results: { parameter: string; name: string; value: number; unit: string; status: string; referenceRange?: { min: number; max: number } }[] = [];
  
  // Get known parameters as a starting point
  const knownParameterKeys = Object.keys(bloodParameterInfo);
  
  const lines = reportText.split('\n');
  
  // Regular expressions for more comprehensive detection
  const parameterPatterns = [
    /([A-Za-z]+(?:[- ][A-Za-z]+)*)\s*[:=]\s*([\d.]+)\s*([a-zA-Z/%µ]*)/i,  // Parameter: 123 unit
    /([A-Za-z]+(?:[- ][A-Za-z]+)*)\s*(?:level|result|value|count)[:=\s]+([\d.]+)\s*([a-zA-Z/%µ]*)/i,  // Parameter level: 123 unit
    /([A-Za-z]+(?:[- ][A-Za-z]+)*)\s+([\d.]+)\s*([a-zA-Z/%µ]*)/i  // Parameter 123 unit
  ];
  
  // Regular expressions for reference ranges
  const refRangePatterns = [
    /reference(?:\s*range)?[:=\s]+([\d.]+)[-–—to]+\s*([\d.]+)/i,  // Reference range: X-Y
    /normal(?:\s*range)?[:=\s]+([\d.]+)[-–—to]+\s*([\d.]+)/i,     // Normal range: X-Y
    /range[:=\s]+([\d.]+)[-–—to]+\s*([\d.]+)/i,                   // Range: X-Y
    /\(([\d.]+)[-–—to]+\s*([\d.]+)\)/i                            // (X-Y)
  ];

  // First, search for table patterns in the report
  const tablePattern = /\|([^|]+)\|([^|]+)\|(?:[^|]+\|)?(?:[^|]+\|)?/g;
  let tableMatch;
  while ((tableMatch = tablePattern.exec(reportText)) !== null) {
    if (tableMatch.length >= 3) {
      const parameterName = tableMatch[1].trim();
      const valueText = tableMatch[2].trim();
      
      // Extract value and unit
      const valueMatch = valueText.match(/([\d.]+)\s*([a-zA-Z/%µ]*)/i);
      if (valueMatch && valueMatch.length >= 2) {
        const value = parseFloat(valueMatch[1]);
        if (!isNaN(value)) {
          const unit = valueMatch[2] || '';
          
          // Normalize the parameter name to create a unique key
          const parameterKey = parameterName.toLowerCase().replace(/[-\s]/g, '_');
          
          // Look for status indicators in the vicinity
          const isHigh = tableMatch[0].toLowerCase().includes('high') || 
                         tableMatch[0].toLowerCase().includes('elevated') ||
                         tableMatch[0].toLowerCase().includes('above');
          const isLow = tableMatch[0].toLowerCase().includes('low') || 
                        tableMatch[0].toLowerCase().includes('decreased') ||
                        tableMatch[0].toLowerCase().includes('below');
          const status = isHigh ? "high" : isLow ? "low" : "normal";
          
          // Look for reference range
          let referenceRange;
          for (const pattern of refRangePatterns) {
            const rangeMatch = tableMatch[0].match(pattern);
            if (rangeMatch && rangeMatch.length >= 3) {
              const min = parseFloat(rangeMatch[1]);
              const max = parseFloat(rangeMatch[2]);
              if (!isNaN(min) && !isNaN(max)) {
                referenceRange = { min, max };
                break;
              }
            }
          }
          
          results.push({
            parameter: parameterKey,
            name: parameterName,
            value,
            unit,
            status,
            referenceRange
          });
        }
      }
    }
  }
  
  // Second, go through each line to find parameters
  lines.forEach(line => {
    // Skip lines that are likely headers or don't contain data
    if (line.trim().length < 5 || /^[-=|]+$/.test(line) || line.split(' ').length < 2) {
      return;
    }
    
    // Try each parameter pattern
    for (const pattern of parameterPatterns) {
      const match = line.match(pattern);
      if (match && match.length >= 3) {
        const parameterName = match[1].trim();
        const value = parseFloat(match[2]);
        
        if (!isNaN(value)) {
          const unit = match[3] ? match[3].trim() : '';
          
          // Normalize the parameter name to create a unique key
          const parameterKey = parameterName.toLowerCase().replace(/[-\s]/g, '_');
          
          // Check if we already found this parameter
          if (results.some(r => r.parameter === parameterKey)) {
            continue;
          }
          
          // Determine status based on text hints
          const lowercaseLine = line.toLowerCase();
          let status = "normal";
          
          if (lowercaseLine.includes('high') || lowercaseLine.includes('elevated') || lowercaseLine.includes('above')) {
            status = "high";
          } else if (lowercaseLine.includes('low') || lowercaseLine.includes('decreased') || lowercaseLine.includes('below')) {
            status = "low";
          }
          
          // Try to find reference range in this line
          let referenceRange;
          for (const rangePattern of refRangePatterns) {
            const rangeMatch = lowercaseLine.match(rangePattern);
            if (rangeMatch && rangeMatch.length >= 3) {
              const min = parseFloat(rangeMatch[1]);
              const max = parseFloat(rangeMatch[2]);
              if (!isNaN(min) && !isNaN(max)) {
                referenceRange = { min, max };
                break;
              }
            }
          }
          
          // If we have a known reference range, use it and update status
          const knownKey = knownParameterKeys.find(key => {
            const info = bloodParameterInfo[key as keyof typeof bloodParameterInfo];
            return info.name.toLowerCase() === parameterName.toLowerCase() || key === parameterKey;
          });
          
          if (knownKey) {
            const knownRange = referenceRanges[knownKey as keyof typeof referenceRanges];
            if (knownRange && !referenceRange) {
              referenceRange = knownRange;
              
              // Update status based on known reference range
              if (value > knownRange.max) {
                status = "high";
              } else if (value < knownRange.min) {
                status = "low";
              } else {
                status = "normal";
              }
            }
          }
          
          // Add to results
          results.push({
            parameter: parameterKey,
            name: parameterName,
            value,
            unit,
            status,
            referenceRange
          });
          
          // Found a match, no need to try other patterns for this line
          break;
        }
      }
    }
  });
  
  // Third, check for well-known parameters by name if they haven't been found yet
  knownParameterKeys.forEach(param => {
    if (!results.find(r => r.parameter === param)) {
      const paramInfo = bloodParameterInfo[param as keyof typeof bloodParameterInfo];
      const searchText = reportText.toLowerCase();
      const nameIndex = searchText.indexOf(paramInfo.name.toLowerCase());
      
      if (nameIndex !== -1) {
        // Found a mention of this parameter, grab the surrounding context
        const contextStart = Math.max(0, nameIndex - 100);
        const contextEnd = Math.min(searchText.length, nameIndex + paramInfo.name.length + 100);
        const context = searchText.slice(contextStart, contextEnd);
        
        // Try to extract value
        for (const pattern of parameterPatterns) {
          const match = context.match(pattern);
          if (match && match.length >= 3) {
            const value = parseFloat(match[2]);
            
            if (!isNaN(value)) {
              const unit = match[3] ? match[3].trim() : '';
              const refRange = referenceRanges[param as keyof typeof referenceRanges];
              
              let status = "normal";
              if (refRange) {
                if (value > refRange.max) status = "high";
                else if (value < refRange.min) status = "low";
              }
              
              results.push({
                parameter: param,
                name: paramInfo.name,
                value,
                unit: unit || (refRange?.unit || ''),
                status,
                referenceRange: refRange
              });
              
              break;
            }
          }
        }
      }
    }
  });
  
  // Sort by name
  return results.sort((a, b) => a.name.localeCompare(b.name));
};

// Calculate health score based on parameter values
export const calculateHealthScore = (paramValues: { parameter: string; name: string; value: number; status: string; referenceRange?: { min: number; max: number } }[]): number => {
  if (paramValues.length === 0) return 100; // Default perfect score
  
  // Calculate a weighted score based on parameter values and their normalized scores
  let totalScore = 0;
  let normalizedScores = 0;
  
  paramValues.forEach(param => {
    if (param.referenceRange) {
      // For parameters with known reference ranges, calculate normalized score
      const paramScore = calculateNormalizedValue(
        param.value, 
        param.referenceRange.min, 
        param.referenceRange.max
      );
      totalScore += paramScore;
      normalizedScores++;
    } else {
      // For parameters without reference ranges, use status
      if (param.status === "normal") {
        totalScore += 100;
      } else if (param.status === "high" || param.status === "low") {
        totalScore += 50; // Penalize abnormal values
      }
      normalizedScores++;
    }
  });
  
  // Average the scores
  return normalizedScores > 0 ? totalScore / normalizedScores : 100;
};
