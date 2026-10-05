import React from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const navigate = useNavigate();

  const redirectToGoogleLogin = () => {
    const clientId = "401600007874-vjps28vdp4496jgqq3s9cilbt1sls3ru.apps.googleusercontent.com";
    const redirectUri = encodeURIComponent("http://localhost:5173/auth/callback");
    const scope = encodeURIComponent("openid email profile https://www.googleapis.com/auth/drive.readonly");
    const responseType = "code";

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

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
              FileDrop
            </h1>
            <p className="text-gray-600 text-lg">Your Cloud File Manager</p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 mb-8 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-lg">✨</span>
              <span>Upload and manage files</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-lg">🔗</span>
              <span>Share with others easily</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-lg">📝</span>
              <span>Edit with Google Docs</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-6"></div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Login with Email
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="w-full px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition font-medium"
            >
              Create New Account
            </button>
          </div>
        </div>

        {/* Google OAuth Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-center text-gray-600 text-sm mb-4">Or continue with</p>
          <button
            onClick={redirectToGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
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
            Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
