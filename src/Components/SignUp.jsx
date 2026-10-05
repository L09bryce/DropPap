import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthService from '../services/AuthService';
import LoadingAnimation from './LoadingAnimation';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    department: '',
    staffLevel: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [staffLevelDropdownOpen, setStaffLevelDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const departments = ['Engineering', 'Science', 'Business', 'Nursing'];
  const roles = ['DEAN', 'HOD', 'STAFF'];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length <= 8) {
      setError('Password must be more than 8 characters');
      return false;
    }
    if (!formData.department) {
      setError('Please select a department');
      return false;
    }
    if (!formData.staffLevel) {
      setError('Please select your staff level');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleDepartmentSelect = (dept) => {
    setFormData((prev) => ({
      ...prev,
      department: dept,
    }));
    setDepartmentDropdownOpen(false);
    setError('');
  };

  const handleStaffLevelSelect = (level) => {
    setFormData((prev) => ({
      ...prev,
      staffLevel: level,
    }));
    setStaffLevelDropdownOpen(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await AuthService.signup(formData);
      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen bg-white flex items-center justify-center px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-black mb-2" style={{ color: '#1E1919' }}>
            Create Account
          </h1>
          <p className="text-gray-600">Join us today and manage your files</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Account created successfully! Redirecting to login...
          </motion.div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Choose a username"
            />
          </motion.div>

          {/* Email Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Enter your email"
            />
          </motion.div>

          {/* Password Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Password must be more than 8 characters</p>
          </motion.div>

          {/* Department Dropdown */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
                disabled={loading}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-left flex justify-between items-center focus:outline-none focus:border-blue-500 transition"
              >
                <span className={formData.department ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.department || 'Select a department'}
                </span>
                <span className={`transition-transform ${departmentDropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Department Dropdown Menu */}
              {departmentDropdownOpen && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {departments.map((dept, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDepartmentSelect(dept)}
                      disabled={loading}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 first:rounded-t-md last:rounded-b-md transition text-gray-700"
                    >
                      {dept}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Staff Level Dropdown */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff Level / Position
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStaffLevelDropdownOpen(!staffLevelDropdownOpen)}
                disabled={loading}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-left flex justify-between items-center focus:outline-none focus:border-blue-500 transition"
              >
                <span className={formData.staffLevel ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.staffLevel || 'Select your level'}
                </span>
                <span className={`transition-transform ${staffLevelDropdownOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Staff Level Dropdown Menu */}
              {staffLevelDropdownOpen && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {roles.map((level, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleStaffLevelSelect(level)}
                      disabled={loading}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 first:rounded-t-md last:rounded-b-md transition text-gray-700"
                    >
                      {level}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium text-white transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            style={{ backgroundColor: loading ? '#999' : '#0061FF' }}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <LoadingAnimation /> : 'Create Account'}
          </motion.button>
        </form>

        {/* Login Link */}
        <motion.p className="text-center text-gray-600 mt-6" variants={itemVariants}>
          Already have an account?{' '}
          <Link to="/login" className="font-medium" style={{ color: '#0061FF' }}>
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SignUp;
