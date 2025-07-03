import { Matrix } from 'ml-matrix';
import { Dataset, TrainedModel, ModelMetrics } from '../types';
import { getDatasetType } from './csvParser';

class LogisticRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number = 0.01;
  private iterations: number = 1000;

  constructor(learningRate = 0.01, iterations = 1000) {
    this.learningRate = learningRate;
    this.iterations = iterations;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-250, Math.min(250, z))));
  }

  train(X: number[][], y: number[]): void {
    const m = X.length;
    const n = X[0].length;
    
    // Initialize weights and bias
    this.weights = new Array(n).fill(0);
    this.bias = 0;

    for (let i = 0; i < this.iterations; i++) {
      // Forward propagation
      const predictions = X.map(row => {
        const z = row.reduce((sum, val, idx) => sum + val * this.weights[idx], this.bias);
        return this.sigmoid(z);
      });

      // Compute gradients
      const dw = new Array(n).fill(0);
      let db = 0;

      for (let j = 0; j < m; j++) {
        const error = predictions[j] - y[j];
        db += error;
        for (let k = 0; k < n; k++) {
          dw[k] += error * X[j][k];
        }
      }

      // Update weights and bias
      for (let k = 0; k < n; k++) {
        this.weights[k] -= (this.learningRate * dw[k]) / m;
      }
      this.bias -= (this.learningRate * db) / m;
    }
  }

  predict(X: number[]): number {
    const z = X.reduce((sum, val, idx) => sum + val * this.weights[idx], this.bias);
    const probability = this.sigmoid(z);
    return probability >= 0.5 ? 1 : 0;
  }

  predictProbability(X: number[]): number {
    const z = X.reduce((sum, val, idx) => sum + val * this.weights[idx], this.bias);
    return this.sigmoid(z);
  }
}

export const trainDiabetesModel = (dataset: Dataset): TrainedModel => {
  const datasetType = getDatasetType(dataset);
  
  // Define features based on dataset type
  let features: string[] = [];
  let targetColumn = '';

  // Normalize column names for lookup
  const normalizedColumns = dataset.columns.map(col => col.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
  const columnMapping: { [key: string]: string } = {};
  
  dataset.columns.forEach((originalCol, index) => {
    columnMapping[normalizedColumns[index]] = originalCol;
  });

  if (datasetType === 'comprehensive') {
    // Comprehensive health indicators dataset
    features = [
      'highbp', 'highchol', 'cholcheck', 'bmi', 'smoker', 'stroke',
      'heartdiseaseorattack', 'physactivity', 'fruits', 'veggies',
      'hvyalcoholconsump', 'anyhealthcare', 'nodocbccost', 'genhlth',
      'menthlth', 'physhlth', 'diffwalk', 'sex', 'age', 'education', 'income'
    ].filter(feature => normalizedColumns.includes(feature));
    
    // Find target column
    if (normalizedColumns.includes('diabetesbinary')) {
      targetColumn = 'diabetesbinary';
    } else if (normalizedColumns.includes('diabetes012')) {
      targetColumn = 'diabetes012';
    }
  } else if (datasetType === 'basic') {
    // Basic Pima Indians style dataset
    features = ['glucose', 'bloodpressure', 'bmi', 'age']
      .filter(feature => normalizedColumns.includes(feature));
    targetColumn = 'outcome';
  } else {
    throw new Error('Unsupported dataset format');
  }

  // Find actual target column
  const actualTargetColumn = columnMapping[targetColumn];
  if (!actualTargetColumn) {
    throw new Error(`Target column '${targetColumn}' not found`);
  }

  console.log('Training with features:', features);
  console.log('Target column:', actualTargetColumn);

  // Extract and prepare features
  const X: number[][] = [];
  const y: number[] = [];

  dataset.data.forEach(row => {
    const featureRow: number[] = [];
    let isValid = true;

    features.forEach(feature => {
      const actualColumn = columnMapping[feature];
      if (actualColumn) {
        const value = Number(row[actualColumn]);
        if (isNaN(value)) {
          isValid = false;
        }
        featureRow.push(value);
      } else {
        isValid = false;
      }
    });

    let target = Number(row[actualTargetColumn]);
    
    // Handle different target formats
    if (targetColumn === 'diabetes012') {
      // Convert 0,1,2 to binary (0 = no diabetes, 1,2 = diabetes)
      target = target > 0 ? 1 : 0;
    }
    
    if (isNaN(target) || !isValid) {
      return; // Skip invalid rows
    }

    X.push(featureRow);
    y.push(target);
  });

  if (X.length === 0) {
    throw new Error('No valid data found for training');
  }

  console.log(`Training with ${X.length} samples and ${features.length} features`);

  // Normalize features
  const means = new Array(features.length).fill(0);
  const stds = new Array(features.length).fill(0);

  // Calculate means
  for (let i = 0; i < features.length; i++) {
    means[i] = X.reduce((sum, row) => sum + row[i], 0) / X.length;
  }

  // Calculate standard deviations
  for (let i = 0; i < features.length; i++) {
    const variance = X.reduce((sum, row) => sum + Math.pow(row[i] - means[i], 2), 0) / X.length;
    stds[i] = Math.sqrt(variance) || 1; // Avoid division by zero
  }

  // Normalize data
  const XNormalized = X.map(row => 
    row.map((val, idx) => stds[idx] === 0 ? 0 : (val - means[idx]) / stds[idx])
  );

  // Split data for training and testing (80/20)
  const splitIndex = Math.floor(X.length * 0.8);
  const XTrain = XNormalized.slice(0, splitIndex);
  const yTrain = y.slice(0, splitIndex);
  const XTest = XNormalized.slice(splitIndex);
  const yTest = y.slice(splitIndex);

  // Train model
  const model = new LogisticRegression(0.01, 1000);
  model.train(XTrain, yTrain);

  // Calculate metrics
  const predictions = XTest.map(row => model.predict(row));
  const metrics = calculateMetrics(yTest, predictions);

  // Return trained model with normalization parameters
  return {
    predict: (input: number[]) => {
      if (input.length !== features.length) {
        throw new Error(`Expected ${features.length} features, got ${input.length}`);
      }
      const normalizedInput = input.map((val, idx) => 
        stds[idx] === 0 ? 0 : (val - means[idx]) / stds[idx]
      );
      return model.predict(normalizedInput);
    },
    features,
    targetColumn: actualTargetColumn,
    metrics,
  };
};

const calculateMetrics = (yTrue: number[], yPred: number[]): ModelMetrics => {
  let tp = 0, fp = 0, tn = 0, fn = 0;

  for (let i = 0; i < yTrue.length; i++) {
    if (yTrue[i] === 1 && yPred[i] === 1) tp++;
    else if (yTrue[i] === 0 && yPred[i] === 1) fp++;
    else if (yTrue[i] === 0 && yPred[i] === 0) tn++;
    else if (yTrue[i] === 1 && yPred[i] === 0) fn++;
  }

  const accuracy = (tp + tn) / (tp + fp + tn + fn);
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix: [[tn, fp], [fn, tp]],
  };
};