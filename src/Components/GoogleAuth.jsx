import React from 'react'

const GoogleAuth = () => {

    const redirectToGoogleLogin = () => {
        const clientId = "401600007874-vjps28vdp4496jgqq3s9cilbt1sls3ru.apps.googleusercontent.com";
        const redirectUri = encodeURIComponent("http://localhost:5173/auth/callback");
        // Include drive.readonly for file access and drive.file for Drive Picker
        const scope = encodeURIComponent("openid email profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file");
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
        <div>
            <a href="#" onClick={redirectToGoogleLogin}>
                Sign in with Google
            </a>
        </div>
    )
}

export default GoogleAuth
