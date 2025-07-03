import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Scatter } from 'react-chartjs-2';
import { Dataset } from '../types';
import { TrendingUp, Users, Target, BarChart3, Activity, Heart, Baby, Droplets } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DataExplorerProps {
  dataset: Dataset;
}

const DataExplorer: React.FC<DataExplorerProps> = ({ dataset }) => {
  const stats = useMemo(() => {
    const data = dataset.data;
    const outcomeColumn = dataset.columns.find(col => col.toLowerCase() === 'outcome');
    
    if (!outcomeColumn) return null;

    const diabeticCount = data.filter(row => Number(row[outcomeColumn]) === 1).length;
    const totalCount = data.length;
    const diabeticRate = (diabeticCount / totalCount) * 100;

    // Calculate feature statistics for Pima Indians dataset
    const features = ['pregnancies', 'glucose', 'bloodpressure', 'skinthickness', 'insulin', 'bmi', 'diabetespedigreefunction', 'age'];
    const featureStats: { [key: string]: any } = {};

    features.forEach(feature => {
      const column = dataset.columns.find(col => col.toLowerCase() === feature);
      if (column) {
        const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        featureStats[feature] = {
          mean,
          min: Math.min(...values),
          max: Math.max(...values),
          std: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length),
        };
      }
    });

    return {
      totalSamples: totalCount,
      diabeticCount,
      nonDiabeticCount: totalCount - diabeticCount,
      diabeticRate,
      featureStats,
    };
  }, [dataset]);

  const chartData = useMemo(() => {
    if (!dataset || !stats) return null;

    const outcomeColumn = dataset.columns.find(col => col.toLowerCase() === 'outcome');
    if (!outcomeColumn) return null;

    // Age distribution
    const ageColumn = dataset.columns.find(col => col.toLowerCase() === 'age');
    const ageDistribution: { [key: string]: number } = {};
    
    if (ageColumn) {
      dataset.data.forEach(row => {
        const age = Number(row[ageColumn]);
        const ageGroup = `${Math.floor(age / 10) * 10}-${Math.floor(age / 10) * 10 + 9}`;
        ageDistribution[ageGroup] = (ageDistribution[ageGroup] || 0) + 1;
      });
    }

    // Pregnancies distribution
    const pregnanciesColumn = dataset.columns.find(col => col.toLowerCase() === 'pregnancies');
    const pregnanciesDistribution: { [key: string]: number } = {};
    
    if (pregnanciesColumn) {
      dataset.data.forEach(row => {
        const pregnancies = Number(row[pregnanciesColumn]);
        const key = pregnancies.toString();
        pregnanciesDistribution[key] = (pregnanciesDistribution[key] || 0) + 1;
      });
    }

    // Glucose vs BMI scatter plot
    const glucoseColumn = dataset.columns.find(col => col.toLowerCase() === 'glucose');
    const bmiColumn = dataset.columns.find(col => col.toLowerCase() === 'bmi');
    
    const scatterData = {
      diabetic: [] as { x: number; y: number }[],
      nonDiabetic: [] as { x: number; y: number }[]
    };

    if (glucoseColumn && bmiColumn) {
      dataset.data.forEach(row => {
        const glucose = Number(row[glucoseColumn]);
        const bmi = Number(row[bmiColumn]);
        const outcome = Number(row[outcomeColumn]);
        
        if (!isNaN(glucose) && !isNaN(bmi)) {
          if (outcome === 1) {
            scatterData.diabetic.push({ x: glucose, y: bmi });
          } else {
            scatterData.nonDiabetic.push({ x: glucose, y: bmi });
          }
        }
      });
    }

    return {
      ageDistribution,
      pregnanciesDistribution,
      scatterData,
    };
  }, [dataset, stats]);

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid Dataset</h3>
          <p className="text-gray-600">Unable to analyze the current dataset.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Data Analysis of Diabetes</h2>
        {/* <p className="text-lg text-gray-600">
          Comprehensive analysis of diabetes risk factors from the 0classic Pima Indians Diabetes Database.
        </p> */}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Samples</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSamples}</p>
              <p className="text-xs text-gray-500 mt-1">Pima Indian women</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diabetes Cases</p>
              <p className="text-3xl font-bold text-red-600">{stats.diabeticCount}</p>
              <p className="text-xs text-gray-500 mt-1">Positive outcomes</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <Target className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non-Diabetes</p>
              <p className="text-3xl font-bold text-green-600">{stats.nonDiabeticCount}</p>
              <p className="text-xs text-gray-500 mt-1">Negative outcomes</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Diabetes Rate</p>
              <p className="text-3xl font-bold text-orange-600">{stats.diabeticRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">Population prevalence</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Outcome Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Diabetes Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={{
                labels: ['Non-Diabetic', 'Diabetic'],
                datasets: [
                  {
                    data: [stats.nonDiabeticCount, stats.diabeticCount],
                    backgroundColor: ['#10B981', '#EF4444'],
                    borderWidth: 0,
                    cutout: '60%',
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Age Distribution */}
        {chartData?.ageDistribution && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Age Distribution</h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.ageDistribution),
                  datasets: [
                    {
                      label: 'Count',
                      data: Object.values(chartData.ageDistribution),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 1,
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Pregnancies Distribution */}
        {chartData?.pregnanciesDistribution && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Baby className="w-5 h-5 mr-2 text-pink-500" />
              Pregnancies Distribution
            </h3>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(chartData.pregnanciesDistribution).slice(0, 10),
                  datasets: [
                    {
                      label: 'Count',
                      data: Object.values(chartData.pregnanciesDistribution).slice(0, 10),
                      backgroundColor: 'rgba(236, 72, 153, 0.8)',
                      borderColor: 'rgb(236, 72, 153)',
                      borderWidth: 1,
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Scatter Plot */}
        {chartData?.scatterData && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-blue-500" />
              Glucose vs BMI Correlation
            </h3>
            <div className="h-80">
              <Scatter
                data={{
                  datasets: [
                    {
                      label: 'Non-Diabetic',
                      data: chartData.scatterData.nonDiabetic,
                      backgroundColor: 'rgba(16, 185, 129, 0.6)',
                      borderColor: 'rgb(16, 185, 129)',
                      pointRadius: 4,
                    },
                    {
                      label: 'Diabetic',
                      data: chartData.scatterData.diabetic,
                      backgroundColor: 'rgba(239, 68, 68, 0.6)',
                      borderColor: 'rgb(239, 68, 68)',
                      pointRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Glucose Level (mg/dL)',
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'BMI',
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Feature Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">Pima Indians Dataset Features</h3>
          <p className="text-gray-600 mt-1">Statistical summary of all 8 medical predictor variables</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mean
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Std Dev
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(stats.featureStats).map(([feature, stat]) => {
                const getFeatureInfo = (feat: string) => {
                  const descriptions: { [key: string]: { icon: any, desc: string } } = {
                    pregnancies: { icon: Baby, desc: 'Number of times pregnant' },
                    glucose: { icon: Droplets, desc: 'Plasma glucose concentration' },
                    bloodpressure: { icon: Heart, desc: 'Diastolic blood pressure (mm Hg)' },
                    skinthickness: { icon: Activity, desc: 'Triceps skin fold thickness (mm)' },
                    insulin: { icon: Activity, desc: '2-Hour serum insulin (mu U/ml)' },
                    bmi: { icon: Activity, desc: 'Body mass index (weight in kg/(height in m)^2)' },
                    diabetespedigreefunction: { icon: Activity, desc: 'Diabetes pedigree function' },
                    age: { icon: Users, desc: 'Age (years)' }
                  };
                  return descriptions[feat] || { icon: Activity, desc: 'Medical measurement' };
                };

                const info = getFeatureInfo(feature);
                const Icon = info.icon;

                return (
                  <tr key={feature} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 capitalize">{feature}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.mean.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.min.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.max.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.std.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {info.desc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Information */}
      {/* <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-semibold text-blue-900 mb-3">About the Pima Indians Diabetes Database</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Originally from the National Institute of Diabetes and Digestive and Kidney Diseases</p>
          <p>• All patients are females at least 21 years old of Pima Indian heritage</p>
          <p>• Contains 768 instances with 8 medical predictor variables and 1 target variable</p>
          <p>• Used extensively in machine learning research for diabetes prediction</p>
          <p>• High diabetes prevalence in this population makes it ideal for studying risk factors</p>
        </div>
      </div> */}
    </div>
  );
};

export default DataExplorer;