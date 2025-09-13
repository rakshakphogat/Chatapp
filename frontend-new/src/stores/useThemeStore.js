import { create } from 'zustand';

const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
];

const useThemeStore = create((set) => ({
  // State
  theme: localStorage.getItem('chat-theme') || 'dark',

  // Set theme
  setTheme: (theme) => {
    localStorage.setItem('chat-theme', theme);
    set({ theme });

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  },

  // Get available themes
  getThemes: () => THEMES,
}));

// Initialize theme on app start
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('chat-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
};

// Call initialization
initializeTheme();

export default useThemeStore;