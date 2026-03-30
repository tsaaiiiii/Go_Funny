export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: 'hsl(var(--card))',
                'card-foreground': 'hsl(var(--card-foreground))',
                primary: 'hsl(var(--primary))',
                'primary-foreground': 'hsl(var(--primary-foreground))',
                secondary: 'hsl(var(--secondary))',
                'secondary-foreground': 'hsl(var(--secondary-foreground))',
                muted: 'hsl(var(--muted))',
                'muted-foreground': 'hsl(var(--muted-foreground))',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                accent: 'hsl(var(--accent))',
                'accent-foreground': 'hsl(var(--accent-foreground))',
                success: 'hsl(var(--success))',
                warning: 'hsl(var(--warning))',
                danger: 'hsl(var(--danger))',
            },
            boxShadow: {
                soft: '0 10px 30px rgba(69, 96, 104, 0.08)',
                float: '0 18px 45px rgba(61, 124, 138, 0.14)',
            },
            borderRadius: {
                xl: '1rem',
                '2xl': '1.5rem',
                '3xl': '1.75rem',
            },
            fontFamily: {
                sans: ['"Noto Sans TC"', '"PingFang TC"', '"Segoe UI"', 'sans-serif'],
            },
            backgroundImage: {
                'travel-wash': 'radial-gradient(circle at top, rgba(169, 201, 214, 0.28), transparent 35%), linear-gradient(180deg, rgba(255, 253, 252, 0.72) 0%, rgba(247, 243, 235, 0.95) 100%)',
            },
        },
    },
    plugins: [],
};
