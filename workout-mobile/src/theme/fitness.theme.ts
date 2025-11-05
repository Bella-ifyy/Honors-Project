// FitTracker - Custom Fitness Theme Design System
// Modern, energetic, and motivational color palette

import { colors as appColors } from './colors';

export const fitnessTheme = {
  // Primary Brand Colors
  colors: {
    // Main brand colors - energetic but bright/premium
    primary: appColors.primaryPurple,
    primaryDark: '#5332D4',
    primaryLight: '#B7A4FF',

    // Accent colors for CTAs and highlights
    accent: appColors.primaryBlue,
    accentDark: '#0F5AD7',
    accentLight: '#9ED0FF',

    // Warning & Energy
    warning: '#FFB545',
    energy: '#FF7D95',

    // Background colors - airy, light surfaces for new system
    background: {
      primary: appColors.background,
      secondary: appColors.surface,
      tertiary: appColors.surfaceMuted,
      elevated: appColors.surface,
    },

    // Text colors
    text: {
      primary: appColors.textPrimary,
      secondary: appColors.textSecondary,
      tertiary: appColors.textMuted,
      disabled: '#B3BED4',
    },

    // Workout type colors
    workout: {
      cardio: {
        primary: '#FF6B9A',
        gradient: ['#FFF7FB', '#FFE5EF', '#FFD1E2'],
      },
      strength: {
        primary: '#FF8A6A',
        gradient: ['#FFF8F3', '#FFE6D8', '#FFD3BF'],
      },
      flexibility: {
        primary: '#61C89A',
        gradient: ['#F5FFF9', '#E0F7EC', '#C7EEDB'],
      },
      sports: {
        primary: '#3BA4FF',
        gradient: ['#F0F7FF', '#D9ECFF', '#BFE0FF'],
      },
      mixed: {
        primary: appColors.primaryBlue,
        gradient: ['#EEF5FF', '#D9E9FF', '#C2DEFF'],
      },
    },

    // UI element colors
    border: appColors.border,
    borderLight: appColors.surfaceMuted,
    divider: 'rgba(15, 23, 42, 0.06)',

    // Semantic colors
    success: '#24C08B',
    error: '#FF6B6B',
    info: appColors.primaryBlue,

    // Overlay colors
    overlay: 'rgba(15, 15, 25, 0.85)',
    overlayLight: 'rgba(15, 15, 25, 0.6)',
  },

  // Typography
  typography: {
    // Font families
    fontFamily: {
      heading: 'Inter-Bold',
      body: 'Inter-Regular',
      mono: 'SpaceMono-Regular',
    },

    // Font sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },

    // Font weights
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing scale (based on 4px)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  // Gradients
  gradients: {
    primary: ['#FFFFFF', '#F5F7FB'],
    accent: ['#E9F2FF', '#D7E7FF'],
    cardio: ['#FFF7FB', '#FFE4EF'],
    strength: ['#FFF7F2', '#FFE4D4'],
    flexibility: ['#F6FFF9', '#E1F7EC'],
    sports: ['#EFF7FF', '#DAEDFF'],
    energy: ['#FFF6EC', '#FFE5C9'],
    dark: ['#131E3C', '#0B1224'],
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
};

// Helper functions
export const getWorkoutGradient = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'cardio':
      return fitnessTheme.gradients.cardio;
    case 'strength':
      return fitnessTheme.gradients.strength;
    case 'flexibility':
      return fitnessTheme.gradients.flexibility;
    case 'sports':
      return fitnessTheme.gradients.sports;
    default:
      return fitnessTheme.gradients.primary;
  }
};

export const getWorkoutColor = (type?: string) => {
  switch (type?.toLowerCase()) {
    case 'cardio':
      return fitnessTheme.colors.workout.cardio.primary;
    case 'strength':
      return fitnessTheme.colors.workout.strength.primary;
    case 'flexibility':
      return fitnessTheme.colors.workout.flexibility.primary;
    case 'sports':
      return fitnessTheme.colors.workout.sports.primary;
    default:
      return appColors.primaryBlue;
  }
};

export default fitnessTheme;
