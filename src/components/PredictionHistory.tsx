import React from 'react';
import { History, Calendar, TrendingUp, AlertTriangle, CheckCircle, Baby, Droplets } from 'lucide-react';

interface PredictionHistoryProps {
  user: any;
}

const PredictionHistory: React.FC<PredictionHistoryProps> = ({ user }) => {
  const predictions = user?.predictions || [];

  const getRiskIcon = (risk: string) => {
    return risk === 'high' ? (
      <AlertTriangle className="w-5 h-5 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  };

  if (predictions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prediction History</h2>
          {/* <p className="text-lg text-gray-600">
            Track your diabetes risk assessments based on Pima Indians Database features over time.
          </p> */}
        </div>

        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Predictions Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't made any risk assessments yet. Start by using the Risk Assessment tool.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Prediction History</h2>
        {/* <p className="text-lg text-gray-600">
          Review your past diabetes risk assessments based on the Pima Indians Database model.
        </p> */}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assessments</p>
              <p className="text-3xl font-bold text-gray-900">{predictions.length}</p>
            </div>
            <History className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk Results</p>
              <p className="text-3xl font-bold text-red-600">
                {predictions.filter((p: any) => p.risk === 'high').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Risk Results</p>
              <p className="text-3xl font-bold text-green-600">
                {predictions.filter((p: any) => p.risk === 'low').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Assessment History</h3>
          <p className="text-gray-600 mt-1">Detailed view of all your Pima Indians Database-based predictions</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {predictions.slice().reverse().map((prediction: any, index: number) => (
            <div key={prediction.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getRiskIcon(prediction.risk)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        prediction.risk === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {prediction.risk === 'high' ? 'High Risk' : 'Low Risk'}
                      </span>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(prediction.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className="flex items-center">
                        <Baby className="w-4 h-4 text-pink-500 mr-1" />
                        <span className="text-gray-500">Pregnancies:</span>
                        <span className="ml-1 font-medium">{prediction.input.pregnancies}</span>
                      </div>
                      <div className="flex items-center">
                        <Droplets className="w-4 h-4 text-red-500 mr-1" />
                        <span className="text-gray-500">Glucose:</span>
                        <span className="ml-1 font-medium">{prediction.input.glucose} mg/dL</span>
                      </div>
                      <div>
                        <span className="text-gray-500">BP:</span>
                        <span className="ml-1 font-medium">{prediction.input.bloodpressure} mmHg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">BMI:</span>
                        <span className="ml-1 font-medium">{prediction.input.bmi}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Skin:</span>
                        <span className="ml-1 font-medium">{prediction.input.skinthickness} mm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Insulin:</span>
                        <span className="ml-1 font-medium">{prediction.input.insulin} μU/ml</span>
                      </div>
                      <div>
                        <span className="text-gray-500">DPF:</span>
                        <span className="ml-1 font-medium">{prediction.input.diabetespedigreefunction?.toFixed(3)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-1 font-medium">{prediction.input.age} years</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    prediction.risk === 'high' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {prediction.result === 1 ? 'Positive' : 'Negative'}
                  </div>
                  {/* <div className="text-sm text-gray-500">
                    Pima Model
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictionHistory;