// src/styles/theme.js
export const colors = {
  primary: {
    50: '#fff5f5',
    100: '#ffb6c1', // Rose
    200: '#ff9faf',
    300: '#ff889d',
    400: '#ff718b',
    500: '#ff5a79',
  },
  secondary: {
    50: '#fffdf5',
    100: '#fff9e6', // Jaune poussin
    200: '#ffedb0',
    300: '#ffe18a',
    400: '#ffd564',
    500: '#ffc93e',
  },
  accent: {
    50: '#f5faf5',
    100: '#d8f0d8', // Vert clair
    200: '#b0e0b0',
    300: '#88d088',
    400: '#60c060',
    500: '#38b038',
  },
  neutral: {
    50: '#faf8f5',
    100: '#f5f0e8', // Beige
    200: '#e8ddd0',
    300: '#dbcab8',
    400: '#ceb7a0',
    500: '#c1a488',
    600: '#ae937a',
    700: '#8b5a2b', // Marron texte
    800: '#5d3a1a',
    900: '#3e2b1a',
  },
};

export const darkTheme = {
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#404040',
  primary: {
    ...colors.primary,
    100: '#b38b8b',
  },
  secondary: {
    ...colors.secondary,
    100: '#4a4a4a',
  },
};