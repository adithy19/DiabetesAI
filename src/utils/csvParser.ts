import Papa from 'papaparse';
import { Dataset, DatasetRow } from '../types';

export const parseCSV = (file: File): Promise<Dataset> => {
  return new Promise((resolve, reject) => {
    console.log('Starting CSV parsing for file:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Check if file is too large for browser memory
    if (file.size > 100 * 1024 * 1024) { // 100MB
      reject(new Error('File too large for browser processing. Please use a file smaller than 100MB.'));
      return;
    }
    
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      transformHeader: (header: string) => {
        // Normalize header names to lowercase and remove extra spaces/special chars
        return header.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      },
      transform: (value: string, field: string) => {
        // Handle common data issues
        if (typeof value === 'string') {
          const trimmed = value.trim();
          
          // Handle empty strings
          if (trimmed === '' || trimmed === 'NULL' || trimmed === 'null' || trimmed === 'N/A') {
            return null;
          }
          
          // Try to convert to number if it looks numeric
          if (/^-?\d*\.?\d+$/.test(trimmed)) {
            const num = parseFloat(trimmed);
            return isNaN(num) ? trimmed : num;
          }
          
          return trimmed;
        }
        
        return value;
      },
      complete: (results) => {
        console.log('Papa parse complete:', {
          rows: results.data.length,
          errors: results.errors.length,
          meta: results.meta
        });
        
        if (results.errors.length > 0) {
          console.error('Papa parse errors:', results.errors);
          
          // Check for critical errors
          const criticalErrors = results.errors.filter(error => 
            error.type === 'Delimiter' || error.type === 'Quotes'
          );
          
          if (criticalErrors.length > 0) {
            reject(new Error(`CSV format error: ${criticalErrors[0].message}. Please check your file format.`));
            return;
          }
          
          // Log non-critical errors but continue
          console.warn('Non-critical CSV parsing errors:', results.errors);
        }

        const data = results.data as DatasetRow[];
        const columns = results.meta.fields || [];

        console.log('Parsed data preview:', {
          totalRows: data.length,
          columns: columns,
          firstRow: data[0],
          lastRow: data[data.length - 1]
        });

        if (data.length === 0) {
          reject(new Error('No data found in CSV file. Please check that your file contains data rows.'));
          return;
        }

        if (columns.length === 0) {
          reject(new Error('No column headers found. Please ensure your CSV file has a header row with column names.'));
          return;
        }

        // Filter out completely empty rows
        const filteredData = data.filter(row => {
          return Object.values(row).some(value => 
            value !== null && value !== undefined && value !== ''
          );
        });

        if (filteredData.length === 0) {
          reject(new Error('No valid data rows found. All rows appear to be empty.'));
          return;
        }

        // Check for reasonable data size
        if (filteredData.length < 10) {
          console.warn('Very small dataset detected:', filteredData.length, 'rows');
        }

        resolve({
          data: filteredData,
          columns,
          filename: file.name,
          uploadedAt: new Date(),
        });
      },
      error: (error) => {
        console.error('Papa parse error:', error);
        reject(new Error(`Failed to parse CSV file: ${error.message}. Please check your file format.`));
      },
    });
  });
};

export const validateDiabetesDataset = (dataset: Dataset): string[] => {
  const errors: string[] = [];
  
  console.log('Validating dataset:', {
    rows: dataset.data.length,
    columns: dataset.columns.length,
    columnNames: dataset.columns
  });

  // Basic validation
  if (dataset.data.length < 5) {
    errors.push(`Dataset too small: only ${dataset.data.length} rows found. Need at least 5 rows for training.`);
  }

  if (dataset.columns.length < 3) {
    errors.push(`Too few columns: only ${dataset.columns.length} found. Need at least 3 columns (features + target).`);
  }

  // Normalize column names for comparison
  const normalizedColumns = dataset.columns.map(col => 
    col.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  );
  
  console.log('Normalized columns:', normalizedColumns);

  // Define possible target columns
  const targetColumns = ['diabetesbinary', 'diabetes012', 'outcome'];
  const hasTargetColumn = targetColumns.some(col => normalizedColumns.includes(col));
  
  if (!hasTargetColumn) {
    errors.push(`Missing target column. Expected one of: ${targetColumns.join(', ')}`);
  }

  // Check for age column (universal requirement)
  if (!normalizedColumns.includes('age')) {
    errors.push('Missing required column: age');
  }

  // Define feature sets for different dataset types
  const comprehensiveFeatures = [
    'highbp', 'highchol', 'cholcheck', 'bmi', 'smoker', 'stroke',
    'heartdiseaseorattack', 'physactivity', 'fruits', 'veggies'
  ];
  
  const basicFeatures = ['glucose', 'bloodpressure', 'bmi'];

  // Check dataset type
  const hasComprehensiveFeatures = comprehensiveFeatures.filter(feature => 
    normalizedColumns.includes(feature)
  ).length >= 5;
  
  const hasBasicFeatures = basicFeatures.filter(feature => 
    normalizedColumns.includes(feature)
  ).length >= 2;

  if (!hasComprehensiveFeatures && !hasBasicFeatures) {
    errors.push(
      'Dataset format not recognized. Please ensure you have either:\n' +
      '• Comprehensive health indicators (HighBP, HighChol, BMI, Smoker, etc.)\n' +
      '• Basic medical features (Glucose, BloodPressure, BMI, Age)'
    );
  }

  // Data quality validation
  if (errors.length === 0) {
    const sampleSize = Math.min(dataset.data.length, 50);
    let validRowCount = 0;
    let nullValueCount = 0;
    let totalValueCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const row = dataset.data[i];
      let rowValid = true;
      let rowNullCount = 0;

      Object.entries(row).forEach(([key, value]) => {
        totalValueCount++;
        
        if (value === null || value === undefined || value === '') {
          nullValueCount++;
          rowNullCount++;
        }
        
        // Check age specifically
        if (key === 'age' && (value === null || value === undefined || isNaN(Number(value)))) {
          rowValid = false;
        }
      });

      // Allow some missing values but not too many
      if (rowNullCount < Object.keys(row).length * 0.5) {
        validRowCount++;
      }
    }

    const nullPercentage = (nullValueCount / totalValueCount) * 100;
    
    if (validRowCount === 0) {
      errors.push('No valid data rows found. Please check that your data contains valid values.');
    } else if (validRowCount < sampleSize * 0.3) {
      errors.push(`Data quality issue: only ${validRowCount} out of ${sampleSize} sample rows are valid. Please check your data format.`);
    }

    if (nullPercentage > 50) {
      errors.push(`High percentage of missing values (${nullPercentage.toFixed(1)}%). Consider data cleaning.`);
    }
  }

  console.log('Validation completed:', {
    errorCount: errors.length,
    errors: errors
  });

  return errors;
};

export const getDatasetType = (dataset: Dataset): 'comprehensive' | 'basic' | 'unknown' => {
  const normalizedColumns = dataset.columns.map(col => 
    col.toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  );
  
  const comprehensiveFeatures = [
    'highbp', 'highchol', 'cholcheck', 'bmi', 'smoker', 'stroke', 
    'heartdiseaseorattack', 'physactivity', 'fruits', 'veggies'
  ];
  
  const basicFeatures = ['glucose', 'bloodpressure', 'bmi'];
  
  const hasComprehensiveFeatures = comprehensiveFeatures.filter(feature => 
    normalizedColumns.includes(feature)
  ).length >= 5;
  
  const hasBasicFeatures = basicFeatures.filter(feature => 
    normalizedColumns.includes(feature)
  ).length >= 2;
  
  if (hasComprehensiveFeatures) return 'comprehensive';
  if (hasBasicFeatures) return 'basic';
  return 'unknown';
};