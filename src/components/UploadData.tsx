import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, ExternalLink, Info } from 'lucide-react';
import { parseCSV, validateDiabetesDataset } from '../utils/csvParser';
import { Dataset } from '../types';

interface UploadDataProps {
  onDatasetUploaded: (dataset: Dataset) => void;
}

const UploadData: React.FC<UploadDataProps> = ({ onDatasetUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
    e.target.value = '';
  };

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      errors.push('Please select a CSV file (.csv extension required)');
    }
    
    // Check file size
    if (file.size === 0) {
      errors.push('The selected file is empty');
    } else if (file.size > 50 * 1024 * 1024) {
      errors.push(`File size too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed: 50MB`);
    }
    
    // Check MIME type
    const validMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
    if (file.type && !validMimeTypes.includes(file.type)) {
      console.warn('Unexpected MIME type:', file.type, 'but proceeding anyway');
    }
    
    return errors;
  };

  const handleFileUpload = async (file: File) => {
    console.log('Starting file upload:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified)
    });
    
    // Reset states
    setErrors([]);
    setUploadSuccess(false);
    setUploadProgress(0);
    
    // Validate file
    const fileErrors = validateFile(file);
    if (fileErrors.length > 0) {
      setErrors(fileErrors);
      return;
    }

    setIsUploading(true);

    try {
      // Simulate progress for user feedback
      setUploadProgress(10);
      
      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(30);
      
      console.log('Starting CSV parsing...');
      const dataset = await parseCSV(file);
      console.log('CSV parsed successfully:', {
        rows: dataset.data.length,
        columns: dataset.columns.length,
        columnNames: dataset.columns
      });
      
      setUploadProgress(70);
      
      console.log('Starting dataset validation...');
      const validationErrors = validateDiabetesDataset(dataset);
      console.log('Validation completed:', {
        errorCount: validationErrors.length,
        errors: validationErrors
      });
      
      setUploadProgress(90);
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setUploadProgress(0);
      } else {
        console.log('Dataset valid, calling onDatasetUploaded');
        setUploadProgress(100);
        onDatasetUploaded(dataset);
        setUploadSuccess(true);
        
        // Reset progress after success
        setTimeout(() => {
          setUploadProgress(0);
          setUploadSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
      
      let errorMessage = 'Failed to upload file';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('parsing')) {
          errorMessage = 'CSV parsing failed. Please ensure your file is a valid CSV with proper formatting.';
        } else if (error.message.includes('memory') || error.message.includes('size')) {
          errorMessage = 'File too large to process. Please try a smaller file or contact support.';
        } else if (error.message.includes('encoding')) {
          errorMessage = 'File encoding issue. Please save your CSV with UTF-8 encoding.';
        }
      }
      
      setErrors([errorMessage]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSampleDataLoad = () => {
    // Enhanced sample data with more realistic values
    const sampleData = [
      { glucose: 148, bloodpressure: 72, bmi: 33.6, age: 50, outcome: 1 },
      { glucose: 85, bloodpressure: 66, bmi: 26.6, age: 31, outcome: 0 },
      { glucose: 183, bloodpressure: 64, bmi: 23.3, age: 32, outcome: 1 },
      { glucose: 89, bloodpressure: 66, bmi: 28.1, age: 21, outcome: 0 },
      { glucose: 137, bloodpressure: 40, bmi: 43.1, age: 33, outcome: 1 },
      { glucose: 116, bloodpressure: 74, bmi: 25.6, age: 30, outcome: 0 },
      { glucose: 78, bloodpressure: 50, bmi: 31.0, age: 26, outcome: 1 },
      { glucose: 115, bloodpressure: 0, bmi: 35.3, age: 29, outcome: 0 },
      { glucose: 197, bloodpressure: 70, bmi: 30.5, age: 53, outcome: 1 },
      { glucose: 125, bloodpressure: 96, bmi: 22.0, age: 21, outcome: 0 },
      { glucose: 110, bloodpressure: 92, bmi: 37.6, age: 30, outcome: 0 },
      { glucose: 168, bloodpressure: 74, bmi: 38.0, age: 34, outcome: 1 },
      { glucose: 139, bloodpressure: 80, bmi: 27.1, age: 57, outcome: 0 },
      { glucose: 189, bloodpressure: 60, bmi: 30.1, age: 59, outcome: 1 },
      { glucose: 166, bloodpressure: 72, bmi: 25.8, age: 51, outcome: 1 },
      { glucose: 100, bloodpressure: 0, bmi: 30.0, age: 32, outcome: 1 },
      { glucose: 118, bloodpressure: 84, bmi: 45.8, age: 31, outcome: 1 },
      { glucose: 107, bloodpressure: 74, bmi: 29.6, age: 31, outcome: 1 },
      { glucose: 103, bloodpressure: 30, bmi: 43.3, age: 33, outcome: 0 },
      { glucose: 115, bloodpressure: 70, bmi: 30.9, age: 43, outcome: 1 },
    ];

    const sampleDataset: Dataset = {
      data: sampleData,
      columns: ['glucose', 'bloodpressure', 'bmi', 'age', 'outcome'],
      filename: 'sample_diabetes_data.csv',
      uploadedAt: new Date(),
    };

    onDatasetUploaded(sampleDataset);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Dataset</h2>
        <p className="text-lg text-gray-600">
          Upload your diabetes dataset to start training the machine learning model. Supports both basic and comprehensive health indicator datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              isDragging
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Drop your CSV file here
                </h3>
                <p className="text-gray-500 mb-4">or click to browse</p>
                
                <input
                  type="file"
                  accept=".csv,text/csv,application/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Choose File
                </label>
              </div>

              {isUploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">Processing...</span>
                  </div>
                  
                  {uploadProgress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSampleDataLoad}
              disabled={isUploading}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <FileText className="w-5 h-5" />
              <span>Load Sample Dataset</span>
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Try the app with sample diabetes data (20 samples)
            </p>
          </div>

          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900 mb-1">Upload Issues</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="whitespace-pre-line">• {error}</li>
                    ))}
                  </ul>
                  
                  <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                    <h5 className="font-medium text-red-800 mb-1">💡 Troubleshooting Tips:</h5>
                    <ul className="text-xs text-red-700 space-y-1">
                      <li>• Ensure your file is saved as CSV format</li>
                      <li>• Check that the file has column headers</li>
                      <li>• Verify the file isn't corrupted or empty</li>
                      <li>• Try opening the file in Excel/Google Sheets first</li>
                      <li>• For large files, try uploading a smaller sample first</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-900">Dataset uploaded successfully!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You can now proceed to data cleaning or exploration.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* File Requirements */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Upload Requirements</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• <strong>Format:</strong> CSV files only (.csv extension)</li>
                  <li>• <strong>Size:</strong> Maximum 50MB</li>
                  <li>• <strong>Headers:</strong> First row must contain column names</li>
                  <li>• <strong>Encoding:</strong> UTF-8 recommended</li>
                  <li>• <strong>Separators:</strong> Comma-separated values</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recommended Datasets */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">📊 Recommended Datasets</h3>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-medium text-green-900 mb-2">🏆 Diabetes Health Indicators Dataset</h4>
                <p className="text-sm text-green-800 mb-3">
                  Comprehensive dataset with 253,680 survey responses and 21+ features including lifestyle factors.
                </p>
                <a
                  href="https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Download from Kaggle</span>
                </a>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-medium text-green-900 mb-2">📊 Pima Indians Diabetes Database</h4>
                <p className="text-sm text-green-800 mb-3">
                  Classic dataset with 768 samples and 8 medical features. Perfect for learning.
                </p>
                <a
                  href="https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Download from Kaggle</span>
                </a>
              </div>
            </div>
          </div>

          {/* Dataset Types */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Dataset Types</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">🔬 Comprehensive Health Indicators:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Target:</strong> diabetes_binary or diabetes_012</li>
                  <li>• <strong>Features:</strong> HighBP, HighChol, BMI, Smoker, Stroke, Age, etc.</li>
                  <li>• <strong>Size:</strong> Typically 20+ columns, 100K+ rows</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">🩺 Basic Medical Dataset:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Required:</strong> glucose, bloodpressure, bmi, age, outcome</li>
                  <li>• <strong>Format:</strong> Numeric values, 0/1 for outcome</li>
                  <li>• <strong>Size:</strong> Typically 5-10 columns, 500+ rows</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadData;