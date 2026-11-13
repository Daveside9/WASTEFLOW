/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'ocean-blue':   '#0D2E45',
        'ocean-mid':    '#123B52',
        'ocean-dark':   '#071C2C',
        'teal':         '#0FA68E',
        'teal-dark':    '#0b8a76',
        'teal-light':   '#13C2A8',
        'seafoam':      '#E8F9F5',
        'slate-custom': '#5A6A7A',
        'amber-custom': '#C97A0A',
        'red-custom':   '#C0392B',
        'green-custom': '#0E7B40',
        'light-gray':   '#F4F7FA',
        'border-light': '#E2EBF0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem',  { lineHeight: '1.08', letterSpacing: '-0.04em', fontWeight: '800' }],
        'h1':      ['2.75rem', { lineHeight: '1.1',  letterSpacing: '-0.03em', fontWeight: '800' }],
        'h2':      ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '700' }],
        'h3':      ['1.25rem', { lineHeight: '1.3',  letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['1.0625rem',{ lineHeight: '1.75' }],
        'body':    ['0.9375rem',{ lineHeight: '1.7' }],
        'small':   ['0.8125rem',{ lineHeight: '1.6' }],
        'xs':      ['0.75rem',  { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(13,46,69,0.06), 0 4px 16px rgba(13,46,69,0.08)',
        'card-hover': '0 4px 8px rgba(13,46,69,0.06), 0 12px 32px rgba(13,46,69,0.12)',
        'teal':       '0 4px 20px rgba(15,166,142,0.35)',
        'teal-hover': '0 6px 28px rgba(15,166,142,0.50)',
        'nav':        '0 1px 0 rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
