import { TextStyle } from 'react-native';

/**
 * Centralized typography configuration.
 * All font families and text presets live here so components
 * never hardcode font strings.
 *
 * If the font changes in the future, update only this file.
 */

export const fonts = {
  regular: 'RobotoCondensed_400Regular',
  bold: 'RobotoCondensed_700Bold',
} as const;

export type FontWeight = keyof typeof fonts;

/** Reusable text style presets aligned with the web design system. */
export const typography = {
  /** Page titles — equivalent to web text-3xl/text-4xl */
  pageTitle: {
    fontFamily: fonts.bold,
    fontSize: 28,
  } satisfies TextStyle,

  /** Section subtitles — equivalent to web text-xl */
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
  } satisfies TextStyle,

  /** Body text — equivalent to web text-base (16px) */
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
  } satisfies TextStyle,

  /** Secondary/small text — equivalent to web text-sm (14px, minimum) */
  caption: {
    fontFamily: fonts.regular,
    fontSize: 14,
  } satisfies TextStyle,

  /** Bold body variant */
  bodyBold: {
    fontFamily: fonts.bold,
    fontSize: 16,
  } satisfies TextStyle,

  /** Bold caption variant */
  captionBold: {
    fontFamily: fonts.bold,
    fontSize: 14,
  } satisfies TextStyle,
} as const;

export type TypographyPreset = keyof typeof typography;
