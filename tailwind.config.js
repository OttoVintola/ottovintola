/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.black'),
            '--tw-prose-headings': theme('colors.black'),
            '--tw-prose-lead': theme('colors.black'),
            '--tw-prose-links': theme('colors.black'),
            '--tw-prose-bold': theme('colors.black'),
            '--tw-prose-counters': theme('colors.black'),
            '--tw-prose-bullets': theme('colors.black'),
            '--tw-prose-hr': theme('colors.black'),
            '--tw-prose-quotes': theme('colors.black'),
            '--tw-prose-quote-borders': theme('colors.black'),
            '--tw-prose-captions': theme('colors.black'),
            '--tw-prose-code': theme('colors.black'),
            '--tw-prose-pre-code': theme('colors.black'),
            '--tw-prose-pre-bg': theme('colors.gray.100'),
            '--tw-prose-th-borders': theme('colors.black'),
            '--tw-prose-td-borders': theme('colors.black'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}


