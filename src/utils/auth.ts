import { User } from '../types';

const USERS_KEY = 'diabetes_app_users';
const CURRENT_USER_KEY = 'diabetes_app_current_user';

export const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveUser = (user: User): void => {
  const users = getStoredUsers();
  const existingIndex = users.findIndex(u => u.email === user.email);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const signUp = (email: string, password: string, name: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    const users = getStoredUsers();
    
    if (users.find(u => u.email === email)) {
      reject(new Error('User already exists with this email'));
      return;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date(),
      predictions: []
    };
    
    saveUser(newUser);
    setCurrentUser(newUser);
    resolve(newUser);
  });
};

export const signIn = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      reject(new Error('User not found'));
      return;
    }
    
    setCurrentUser(user);
    resolve(user);
  });
};

export const signOut = (): void => {
  setCurrentUser(null);
};

export const updateUserPredictions = (userId: string, prediction: any): void => {
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex >= 0) {
    users[userIndex].predictions.push(prediction);
    saveUser(users[userIndex]);
    setCurrentUser(users[userIndex]);
  }
};