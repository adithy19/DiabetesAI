import React, { useState } from 'react';
import { Target, Calculator, AlertTriangle, CheckCircle, TrendingUp, Heart, Activity, Baby, Droplets } from 'lucide-react';
import { predictDiabetes, modelMetrics } from '../utils/pretrainedModel';
import { updateUserPredictions } from '../utils/auth';

interface PredictionsProps {
  user: any;
}

const Predictions: React.FC<PredictionsProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    pregnancies: 1,
    glucose: 120,
    bloodpressure: 80,
    skinthickness: 20,
    insulin: 80,
    bmi: 25,
    diabetespedigreefunction: 0.5,
    age: 30,
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
    setPrediction(null);
  };
  const handlePredict = () => {
    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const result = predictDiabetes(formData);
        setPrediction(result);
        
        // Save prediction to user history
        const predictionRecord = {
          id: Date.now().toString(),
          input: formData,
          result: result.prediction,
          risk: result.risk,
          timestamp: new Date(),
        };
        
        updateUserPredictions(user.id, predictionRecord);
      } catch (error) {
        console.error('Prediction error:', error);
        setPrediction(null);
      } finally {
        setIsCalculating(false);
      }
    }, 1000);
  };

  const getHealthAdvice = () => {
    const advice = [];
    const { pregnancies, glucose, bloodpressure, bmi, age, insulin, diabetespedigreefunction } = formData;
    
    if (glucose > 140) {
      advice.push("Elevated glucose levels detected. Consider consulting a healthcare provider for blood sugar management and possible glucose tolerance testing.");
    }
    if (bloodpressure > 90) {
      advice.push("High diastolic blood pressure. Monitor regularly and consider lifestyle modifications including reduced sodium intake and regular exercise.");
    }
    if (bmi > 30) {
      advice.push("BMI indicates obesity, which is a significant risk factor for diabetes. A structured weight management program may be beneficial.");
    } else if (bmi > 25) {
      advice.push("BMI indicates overweight status. Maintaining a healthy weight through diet and exercise can reduce diabetes risk.");
    }
    if (age > 45) {
      advice.push("Age is a risk factor for diabetes. Regular health screenings and preventive care become increasingly important.");
    }
    if (pregnancies > 4) {
      advice.push("Multiple pregnancies can increase diabetes risk. Regular monitoring and healthy lifestyle choices are important.");
    }
    if (diabetespedigreefunction > 0.8) {
      advice.push("Strong family history of diabetes detected. Genetic predisposition makes lifestyle modifications even more crucial.");
    }
    if (insulin > 200) {
      advice.push("Elevated insulin levels may indicate insulin resistance. Consider consulting with an endocrinologist.");
    }

    if (advice.length === 0) {
      advice.push("Your health indicators look good! Continue maintaining a healthy lifestyle with regular exercise and balanced nutrition.");
    }

    return advice;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Diabetes Risk Assessment</h2>
        <p className="text-lg text-gray-600">
          Enter your health information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blue-600" />
            Health Information
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Baby className="w-4 h-4 mr-1 text-pink-500" />
                  Pregnancies
                </label>
                <input
                  type="number"
                  id="pregenciesId"
                  value={formData.pregnancies}
                  onChange={(e) => handleInputChange('pregnancies', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  max="20"
                />
                <p className="text-xs text-gray-500 mt-2">Number of times pregnant</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Droplets className="w-4 h-4 mr-1 text-red-500" />
                  Glucose (mg/dL)
                </label>
                <input
                  type="number"
                  value={formData.glucose}
                  onChange={(e) => handleInputChange('glucose', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  max="300"
                />
                <p className="text-xs text-gray-500 mt-2">Plasma glucose concentration</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.bloodpressure}
                  onChange={(e) => handleInputChange('bloodpressure', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  max="200"
                />
                <p className="text-xs text-gray-500 mt-2">Diastolic blood pressure</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skin Thickness (mm)
                </label>
                <input
                  type="number"
                  value={formData.skinthickness}
                  onChange={(e) => handleInputChange('skinthickness', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-2">Triceps skin fold thickness</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Insulin (μU/ml)
                </label>
                <input
                  type="number"
                  value={formData.insulin}
                  onChange={(e) => handleInputChange('insulin', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  max="1000"
                />
                <p className="text-xs text-gray-500 mt-2">2-Hour serum insulin</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  BMI
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={(e) => handleInputChange('bmi', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="10"
                  max="70"
                />
                <p className="text-xs text-gray-500 mt-2">Body mass index</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Diabetes Pedigree Function
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.diabetespedigreefunction}
                  onChange={(e) => handleInputChange('diabetespedigreefunction', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="0"
                  max="3"
                />
                <p className="text-xs text-gray-500 mt-2">Genetic diabetes likelihood</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age (years)
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  min="1"
                  max="120"
                />
                <p className="text-xs text-gray-500 mt-2">Age in years</p>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={isCalculating}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  <span>Assess Diabetes Risk</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Prediction Result */}
          {prediction && (
            <div className={`bg-white rounded-2xl shadow-sm border p-8 ${
              prediction.risk === 'high' ? 'border-red-200' : 'border-green-200'
            }`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Assessment Result</h3>
              
              <div className={`text-center py-8 rounded-xl ${
                prediction.risk === 'high' ? 'bg-red-50' : 'bg-green-50'
              }`}>
                {prediction.risk === 'high' ? (
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                ) : (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                )}
                
                <div className={`text-3xl font-bold mb-3 ${
                  prediction.risk === 'high' ? 'text-red-700' : 'text-green-700'
                }`}>
                  {prediction.risk === 'high' ? 'High Risk' : 'Low Risk'}
                </div>
                
                <div className={`text-lg mb-2 ${
                  prediction.risk === 'high' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {(prediction.probability * 100).toFixed(1)}% probability
                </div>
                
                <p className={`text-sm ${
                  prediction.risk === 'high' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {prediction.risk === 'high' 
                    ? 'The model indicates elevated diabetes risk based on Pima Indians database patterns'
                    : 'The model indicates lower diabetes risk based on Pima Indians database patterns'
                  }
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  <strong>Medical Disclaimer:</strong> This AI assessment is based on the Pima Indians Diabetes Database 
                  and is for informational purposes only. It should not replace professional medical advice. 
                  Please consult with a healthcare provider for proper diagnosis, treatment, and medical guidance.
                </p>
              </div>
            </div>
          )}

          {/* Model Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-purple-600" />
              Model Performance
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {(modelMetrics.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-blue-800">Accuracy</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {(modelMetrics.precision * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-green-800">Precision</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p><strong>Dataset:</strong> Pima Indians Diabetes Database</p>
              <p><strong>Features:</strong> 8 medical predictors</p>
              <p><strong>Model:</strong> Logistic Regression</p>
              <p><strong>Validation:</strong> Cross-validated on 768 samples</p>
            </div>
          </div>

          {/* Health Recommendations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-orange-500 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Recommendations</h3>
                <ul className="space-y-3">
                  {getHealthAdvice().map((advice, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;