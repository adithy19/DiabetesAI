import React, { useState, useMemo } from 'react';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Download, Settings } from 'lucide-react';
import { Dataset, DatasetRow } from '../types';

interface DataCleanerProps {
  dataset: Dataset | null;
  onDatasetCleaned: (cleanedDataset: Dataset) => void;
}

interface MissingValueInfo {
  column: string;
  missingCount: number;
  missingPercentage: number;
  dataType: 'numeric' | 'text';
}

type CleaningStrategy = 'remove' | 'mean' | 'median' | 'mode' | 'zero';

const DataCleaner: React.FC<DataCleanerProps> = ({ dataset, onDatasetCleaned }) => {
  const [cleaningStrategy, setCleaningStrategy] = useState<CleaningStrategy>('remove');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanedDataset, setCleanedDataset] = useState<Dataset | null>(null);

  const missingValueAnalysis = useMemo(() => {
    if (!dataset) return [];

    const analysis: MissingValueInfo[] = [];

    dataset.columns.forEach(column => {
      let missingCount = 0;
      let numericValues = 0;
      let totalValues = 0;

      dataset.data.forEach(row => {
        const value = row[column];
        totalValues++;
        
        if (value === null || value === undefined || value === '' || 
            (typeof value === 'string' && value.trim() === '') ||
            (typeof value === 'number' && isNaN(value))) {
          missingCount++;
        } else if (typeof value === 'number' && !isNaN(value)) {
          numericValues++;
        }
      });

      const missingPercentage = (missingCount / totalValues) * 100;
      const dataType = numericValues > totalValues * 0.8 ? 'numeric' : 'text';

      if (missingCount > 0) {
        analysis.push({
          column,
          missingCount,
          missingPercentage,
          dataType,
        });
      }
    });

    return analysis;
  }, [dataset]);

  const handleCleanData = async () => {
    if (!dataset) return;

    setIsProcessing(true);

    try {
      let cleanedData: DatasetRow[] = [...dataset.data];

      if (cleaningStrategy === 'remove') {
        // Remove rows with any missing values
        cleanedData = cleanedData.filter(row => {
          return dataset.columns.every(column => {
            const value = row[column];
            return value !== null && value !== undefined && value !== '' &&
                   !(typeof value === 'string' && value.trim() === '') &&
                   !(typeof value === 'number' && isNaN(value));
          });
        });
      } else {
        // Fill missing values based on strategy
        const columnStats: { [key: string]: any } = {};

        // Calculate statistics for each column
        dataset.columns.forEach(column => {
          const validValues = cleanedData
            .map(row => row[column])
            .filter(value => 
              value !== null && value !== undefined && value !== '' &&
              !(typeof value === 'string' && value.trim() === '') &&
              !(typeof value === 'number' && isNaN(value))
            );

          if (validValues.length > 0) {
            const numericValues = validValues
              .map(v => Number(v))
              .filter(v => !isNaN(v));

            if (numericValues.length > validValues.length * 0.8) {
              // Numeric column
              const sorted = [...numericValues].sort((a, b) => a - b);
              columnStats[column] = {
                mean: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
                median: sorted[Math.floor(sorted.length / 2)],
                mode: findMode(numericValues),
                type: 'numeric'
              };
            } else {
              // Text column
              columnStats[column] = {
                mode: findMode(validValues),
                type: 'text'
              };
            }
          }
        });

        // Fill missing values
        cleanedData = cleanedData.map(row => {
          const newRow = { ...row };
          
          dataset.columns.forEach(column => {
            const value = row[column];
            const isEmpty = value === null || value === undefined || value === '' ||
                           (typeof value === 'string' && value.trim() === '') ||
                           (typeof value === 'number' && isNaN(value));

            if (isEmpty && columnStats[column]) {
              const stats = columnStats[column];
              
              switch (cleaningStrategy) {
                case 'mean':
                  newRow[column] = stats.type === 'numeric' ? stats.mean : stats.mode;
                  break;
                case 'median':
                  newRow[column] = stats.type === 'numeric' ? stats.median : stats.mode;
                  break;
                case 'mode':
                  newRow[column] = stats.mode;
                  break;
                case 'zero':
                  newRow[column] = stats.type === 'numeric' ? 0 : '';
                  break;
              }
            }
          });

          return newRow;
        });
      }

      const cleaned: Dataset = {
        ...dataset,
        data: cleanedData,
        filename: `cleaned_${dataset.filename}`,
        uploadedAt: new Date(),
      };

      setCleanedDataset(cleaned);
      onDatasetCleaned(cleaned);
    } catch (error) {
      console.error('Error cleaning data:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const findMode = (values: any[]): any => {
    const frequency: { [key: string]: number } = {};
    values.forEach(value => {
      const key = String(value);
      frequency[key] = (frequency[key] || 0) + 1;
    });

    let maxCount = 0;
    let mode = values[0];
    
    Object.entries(frequency).forEach(([value, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mode = isNaN(Number(value)) ? value : Number(value);
      }
    });

    return mode;
  };

  const handleExportCleaned = () => {
    if (!cleanedDataset) return;

    const csv = [
      cleanedDataset.columns.join(','),
      ...cleanedDataset.data.map(row => 
        cleanedDataset.columns.map(col => row[col]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanedDataset.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!dataset) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Dataset to Clean</h3>
          <p className="text-gray-600">Upload a dataset first to start data cleaning.</p>
        </div>
      </div>
    );
  }

  const totalMissingValues = missingValueAnalysis.reduce((sum, info) => sum + info.missingCount, 0);
  const originalRowCount = dataset.data.length;
  const cleanedRowCount = cleanedDataset?.data.length || 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Cleaning</h2>
        <p className="text-lg text-gray-600">
          Identify and handle missing values in your dataset to improve model performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missing Values Analysis */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Missing Values Analysis</h3>
            
            {missingValueAnalysis.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">No missing values detected!</p>
                <p className="text-sm text-gray-600 mt-1">Your dataset is clean and ready for training.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {totalMissingValues} missing values found across {missingValueAnalysis.length} columns
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Column</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Missing</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">%</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {missingValueAnalysis.map((info, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 font-medium text-gray-900">{info.column}</td>
                          <td className="px-3 py-2 text-gray-600">{info.missingCount}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              info.missingPercentage > 20 
                                ? 'bg-red-100 text-red-800'
                                : info.missingPercentage > 10
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {info.missingPercentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              info.dataType === 'numeric' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {info.dataType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Cleaning Strategy */}
          {missingValueAnalysis.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cleaning Strategy</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="remove"
                    checked={cleaningStrategy === 'remove'}
                    onChange={(e) => setCleaningStrategy(e.target.value as CleaningStrategy)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Remove rows</span>
                    <p className="text-sm text-gray-600">Delete all rows containing missing values</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="mean"
                    checked={cleaningStrategy === 'mean'}
                    onChange={(e) => setCleaningStrategy(e.target.value as CleaningStrategy)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Fill with mean</span>
                    <p className="text-sm text-gray-600">Replace with column average (numeric) or mode (text)</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="median"
                    checked={cleaningStrategy === 'median'}
                    onChange={(e) => setCleaningStrategy(e.target.value as CleaningStrategy)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Fill with median</span>
                    <p className="text-sm text-gray-600">Replace with column median (numeric) or mode (text)</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="mode"
                    checked={cleaningStrategy === 'mode'}
                    onChange={(e) => setCleaningStrategy(e.target.value as CleaningStrategy)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Fill with mode</span>
                    <p className="text-sm text-gray-600">Replace with most frequent value</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    value="zero"
                    checked={cleaningStrategy === 'zero'}
                    onChange={(e) => setCleaningStrategy(e.target.value as CleaningStrategy)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Fill with zero</span>
                    <p className="text-sm text-gray-600">Replace with 0 (numeric) or empty string (text)</p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleCleanData}
                disabled={isProcessing}
                className="w-full mt-6 flex items-center justify-center space-x-2 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Settings className="w-5 h-5" />
                    <span>Clean Dataset</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-6">
          {cleanedDataset && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cleaning Results</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{originalRowCount}</div>
                    <div className="text-sm text-blue-800">Original Rows</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{cleanedRowCount}</div>
                    <div className="text-sm text-green-800">Cleaned Rows</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Retention:</span>
                    <span className="font-medium text-gray-900">
                      {((cleanedRowCount / originalRowCount) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Rows Removed:</span>
                    <span className="font-medium text-red-600">
                      {originalRowCount - cleanedRowCount}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleExportCleaned}
                    className="flex items-center space-x-2 bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Cleaned</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Dataset Cleaned Successfully!</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Missing values have been handled using {cleaningStrategy} strategy</li>
                      <li>• Dataset is now ready for machine learning training</li>
                      <li>• You can proceed to the Data Explorer or Train Model tabs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {missingValueAnalysis.length === 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Dataset is Already Clean!</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• No missing values detected in your dataset</li>
                    <li>• All columns have complete data</li>
                    <li>• Ready for machine learning training</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCleaner;