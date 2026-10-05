export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dropbox-blue': '#0061FF',
                'light-grey': '#F5F5F5',
            },
            fontFamily: {
                'sans': ['Inter', 'SF Pro Display', 'sans-serif'],
            },
            animation: {
                'slide-up': 'slideUpFade 0.8s ease-out forwards',
            },
            keyframes: {
                slideUpFade: {
                    'from': {
                        opacity: '0',
                        transform: 'translateY(40px)',
                    },
                    'to': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
            },
        },
    },
    plugins: [],
}
