import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1F4E79',
          mid: '#2E75B6',
          light: '#DEEAF1',
          xlight: '#EBF3FB',
        },
      },
    },
  },
  plugins: [],
}
export default config
