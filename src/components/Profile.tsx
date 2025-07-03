import React, { useState } from 'react';
import { User, Mail, Calendar, Activity, Edit2, Save, X } from 'lucide-react';

interface ProfileProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSave = () => {
    const updatedUser = { ...user, ...editData };
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile</h2>
        <p className="text-lg text-gray-600">
          Manage your account information and view your activity summary.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-1 bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Since
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Activity Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-sm text-blue-800">Total Predictions</span>
                <span className="font-bold text-blue-900">{user?.predictions?.length || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                <span className="text-sm text-red-800">High Risk Results</span>
                <span className="font-bold text-red-900">
                  {user?.predictions?.filter((p: any) => p.risk === 'high').length || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-green-800">Low Risk Results</span>
                <span className="font-bold text-green-900">
                  {user?.predictions?.filter((p: any) => p.risk === 'low').length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-3">Health Tip</h4>
            <p className="text-sm text-blue-800">
              Regular health monitoring and lifestyle changes can significantly reduce diabetes risk. 
              Keep track of your assessments and consult with healthcare professionals for personalized advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;