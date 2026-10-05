import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');

        if (code) {
            // Exchange code for JWT and tokens
            fetch('http://localhost:8080/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('OAuth Response:', data);
                    
                    // Store JWT token (for API authorization)
                    const jwtToken = data.token;
                    if (jwtToken) {
                        console.log('JWT Token stored');
                        localStorage.setItem('token', jwtToken);
                    } else {
                        console.error('No JWT token in response');
                    }
                    
                    // Store Google access token (for Drive API)
                    const googleToken = data.googleAccessToken;
                    if (googleToken) {
                        console.log('Google Access Token stored');
                        localStorage.setItem('googleAccessToken', googleToken);
                    } else {
                        console.error('No Google access token in response');
                    }
                    
                    // Store user email if available
                    if (data.user?.email) {
                        localStorage.setItem('userEmail', data.user.email);
                        console.log('Stored userEmail:', data.user.email);
                    }
                    
                    // Store user role if available
                    if (data.user?.role !== undefined) {
                        localStorage.setItem('userRole', data.user.role);
                        console.log('Stored userRole:', data.user.role);
                    }
                    
                    navigate('/home');
                })
                .catch((err) => {
                    console.error('Auth error:', err);
                    navigate('/');
                });
        } else {
            navigate('/');
        }
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-xl text-gray-700 font-medium">Authenticating...</p>
            </div>
        </div>
    );
};

export default AuthCallback;