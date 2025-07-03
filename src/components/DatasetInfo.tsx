import React from 'react';
import { Database, Download, Calendar, FileText, Users, Target } from 'lucide-react';
import { Dataset } from '../types';

interface DatasetInfoProps {
  dataset: Dataset | null;
}

const DatasetInfo: React.FC<DatasetInfoProps> = ({ dataset }) => {
  const handleExportData = () => {
    if (!dataset) return;

    const csv = [
      dataset.columns.join(','),
      ...dataset.data.map(row => 
        dataset.columns.map(col => row[col]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed_${dataset.filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!dataset) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Dataset Information</h3>
          <p className="text-gray-600">Upload a dataset to view detailed information.</p>
        </div>
      </div>
    );
  }

  const diabeticCount = dataset.data.filter(row => {
    const outcomeColumn = dataset.columns.find(col => col.toLowerCase() === 'outcome');
    return outcomeColumn && Number(row[outcomeColumn]) === 1;
  }).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Dataset Information</h2>
        <p className="text-lg text-gray-600">
          Detailed overview of your uploaded diabetes dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* File Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">File Details</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Filename</p>
              <p className="font-medium text-gray-900">{dataset.filename}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Upload Date</p>
              <p className="font-medium text-gray-900">
                {dataset.uploadedAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Format</p>
              <p className="font-medium text-gray-900">CSV</p>
            </div>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Data Overview</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total Samples</p>
              <p className="font-medium text-gray-900">{dataset.data.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Features</p>
              <p className="font-medium text-gray-900">{dataset.columns.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="font-medium text-gray-900">
                {Math.round(JSON.stringify(dataset.data).length / 1024)} KB
              </p>
            </div>
          </div>
        </div>

        {/* Target Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Target Distribution</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Diabetic Cases</p>
              <p className="font-medium text-red-600">{diabeticCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Non-Diabetic Cases</p>
              <p className="font-medium text-green-600">{dataset.data.length - diabeticCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Diabetes Rate</p>
              <p className="font-medium text-gray-900">
                {((diabeticCount / dataset.data.length) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Column Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Column Information</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Column Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sample Values
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataset.columns.map((column, index) => {
                const sampleValues = dataset.data
                  .slice(0, 3)
                  .map(row => row[column])
                  .join(', ');
                
                const isNumeric = dataset.data.some(row => 
                  typeof row[column] === 'number' && !isNaN(row[column] as number)
                );

                const getDescription = (col: string) => {
                  const colLower = col.toLowerCase();
                  if (colLower === 'glucose') return 'Blood glucose concentration';
                  if (colLower === 'bloodpressure') return 'Diastolic blood pressure (mmHg)';
                  if (colLower === 'bmi') return 'Body mass index (weight in kg/(height in m)^2)';
                  if (colLower === 'age') return 'Age in years';
                  if (colLower === 'outcome') return 'Target variable (0 = non-diabetic, 1 = diabetic)';
                  return 'Additional feature';
                };

                return (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {column}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        isNumeric 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isNumeric ? 'Numeric' : 'Text'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {sampleValues}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {getDescription(column)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Actions</h3>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Dataset</span>
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Last modified: {dataset.uploadedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetInfo;