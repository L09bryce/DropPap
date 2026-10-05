import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthService from '../services/AuthService';
import LoadingAnimation from './LoadingAnimation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email or username is required');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await AuthService.login({ username: email, password });
      
      // ========== DEBUG LOGGING ==========
      console.log('========== LOGIN DEBUG ==========');
      console.log('Full login response:', JSON.stringify(result, null, 2));
      console.log('result.data:', result?.data);
      console.log('result.data.user:', result?.data?.user);
      console.log('result.data.user.email:', result?.data?.user?.email);
      console.log('result.data.user.role:', result?.data?.user?.role);
      console.log('typeof result.data.user.role:', typeof result?.data?.user?.role);
      console.log('==================================');
      // ====================================
      
      // Save user email from response (actual email from database)
      // The response structure is: { success, token, data: { token, message, user: { email, username, role } } }
      const userEmail = result?.data?.user?.email || email;
      localStorage.setItem('userEmail', userEmail);
      console.log('Stored userEmail:', userEmail);
      
      // Also store the role if available
      const userRole = result?.data?.user?.role;
      if (userRole !== undefined && userRole !== null) {
        localStorage.setItem('userRole', userRole.toString());
        console.log('Stored userRole:', userRole);
      } else {
        console.log('WARNING: No role in response!');
      }
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', email);
      }
      setSuccess(true);

      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err) {
      console.error('Caught error:', err);
      let errorMessage = 'Login failed. Please try again.';
      if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.error) {
        errorMessage = err.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const redirectToGoogleLogin = () => {
    const clientId = '401600007874-vjps28vdp4496jgqq3s9cilbt1sls3ru.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent('http://localhost:5173/auth/callback');
    // Include drive.readonly for file access and drive.file for Drive Picker
    const scope = encodeURIComponent('openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file');
    const responseType = 'code';

    const oauth2Url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=${responseType}` +
      `&client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}` +
      `&access_type=offline` +
      `&prompt=consent`;

    window.location.href = oauth2Url;
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
            Login
          </h1>
          <p className="text-gray-600">Welcome back to your file manager</p>
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
            Login successful! Redirecting...
          </motion.div>
        )}

        {/* Google Sign In */}
        <motion.button
          onClick={redirectToGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition font-medium text-gray-700 mb-4 disabled:opacity-50"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </motion.button>

        {/* Divider */}
        <motion.div className="flex items-center gap-4 mb-6" variants={itemVariants}>
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email/Username Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              placeholder="Enter your email or username"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                placeholder="Enter your password"
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
          </motion.div>

          {/* Remember Me & Forgot Password */}
          <motion.div className="flex items-center justify-between" variants={itemVariants}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-sm font-medium"
              style={{ color: '#0061FF' }}
            >
              Forgot password?
            </a>
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
            {loading ? <LoadingAnimation /> : 'Sign In'}
          </motion.button>
        </form>

        {/* Sign Up Link */}
        <motion.p className="text-center text-gray-600 mt-6" variants={itemVariants}>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium" style={{ color: '#0061FF' }}>
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
