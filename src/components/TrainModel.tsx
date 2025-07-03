import React, { useState } from 'react';
import { Brain, Zap, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Dataset, TrainedModel } from '../types';
import { trainDiabetesModel } from '../utils/mlModel';

interface TrainModelProps {
  dataset: Dataset | null;
  onModelTrained: (model: TrainedModel) => void;
}

const TrainModel: React.FC<TrainModelProps> = ({ dataset, onModelTrained }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainedModel, setTrainedModel] = useState<TrainedModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrainModel = async () => {
    if (!dataset) return;

    setIsTraining(true);
    setError(null);

    try {
      const model = trainDiabetesModel(dataset);
      setTrainedModel(model);
      onModelTrained(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to train model');
    } finally {
      setIsTraining(false);
    }
  };

  if (!dataset) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Dataset Available</h3>
          <p className="text-gray-600">Upload a dataset first to train the machine learning model.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Train ML Model</h2>
        <p className="text-lg text-gray-600">
          Train a logistic regression model to predict diabetes based on your dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Dataset Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Filename:</span>
                <span className="font-medium text-gray-900">{dataset.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Samples:</span>
                <span className="font-medium text-gray-900">{dataset.data.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Features:</span>
                <span className="font-medium text-gray-900">{dataset.columns.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uploaded:</span>
                <span className="font-medium text-gray-900">
                  {dataset.uploadedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Model Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algorithm
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="font-medium text-gray-900">Logistic Regression</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Optimized for binary classification with feature normalization
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Features
                </label>
                <div className="space-y-2">
                  {['glucose', 'bloodpressure', 'bmi', 'age'].map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 capitalize">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Variable
                </label>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-700">outcome (0/1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Training Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training</h3>
            
            {!trainedModel && !isTraining && (
              <button
                onClick={handleTrainModel}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap className="w-5 h-5" />
                <span>Start Training</span>
              </button>
            )}

            {isTraining && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Training model...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Training Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {trainedModel && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-900">Model Trained Successfully!</span>
                </div>
                <p className="text-sm text-green-700">
                  Your model is ready for making predictions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Model Performance */}
        {trainedModel && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {(trainedModel.metrics.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-800">Accuracy</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(trainedModel.metrics.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-800">Precision</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {(trainedModel.metrics.recall * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-orange-800">Recall</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {(trainedModel.metrics.f1Score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-800">F1 Score</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Confusion Matrix</h4>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  <div className="text-center p-3 bg-gray-100 rounded text-sm font-medium">
                    TN: {trainedModel.metrics.confusionMatrix[0][0]}
                  </div>
                  <div className="text-center p-3 bg-red-100 rounded text-sm font-medium">
                    FP: {trainedModel.metrics.confusionMatrix[0][1]}
                  </div>
                  <div className="text-center p-3 bg-red-100 rounded text-sm font-medium">
                    FN: {trainedModel.metrics.confusionMatrix[1][0]}
                  </div>
                  <div className="text-center p-3 bg-green-100 rounded text-sm font-medium">
                    TP: {trainedModel.metrics.confusionMatrix[1][1]}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Model Insights</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Model uses 80/20 train-test split for validation</li>
                    <li>• Features are normalized for optimal performance</li>
                    <li>• Logistic regression with 1000 training iterations</li>
                    <li>• Ready for real-time predictions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainModel;