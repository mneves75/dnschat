module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'git add'
  ],
  '*.{js,jsx,ts,tsx,json,md}': [
    'prettier --write',
    'git add'
  ]
};