import defaultBackground from '../assets/hero-lunarscoop-alt.jpg';
import type { ImageMetadata } from 'astro';

export type HeroBackground = string | ImageMetadata;

/**
 * Hero copy and background settings for one page.
 */
export interface HeroSectionConfig {
  /**
   * Main hero headline text.
   */
  text: string;
  /**
   * Optional hero subtitle text.
   */
  subtitle?: string;
  /**
   * Hero background image URL.
   */
  backgroundImage: HeroBackground;
}

/**
 * Centralized hero configuration for all top-level pages and post fallback.
 */
export interface HeroConfig {
  home: HeroSectionConfig;
  blog: HeroSectionConfig;
  projects: HeroSectionConfig;
  tags: HeroSectionConfig;
  about: HeroSectionConfig;
  /**
   * Default hero image for article pages when frontmatter `heroImage` is empty.
   */
  postDefaultBackground: HeroBackground;
}

export const heroConfig: HeroConfig = {
  home: {
    text: 'Writing down what I learn along the way',
    subtitle: 'Learning as I go',
    backgroundImage: defaultBackground,
  },
  blog: {
    text: 'Blog',
    subtitle: 'Notes, thoughts, and what I am learning.',
    backgroundImage: defaultBackground,
  },
  projects: {
    text: 'Projects_',
    subtitle: "Things I've built and explored.",
    backgroundImage: defaultBackground,
  },
  tags: {
    text: 'Tags',
    subtitle: 'Explore topics by category and tag.',
    backgroundImage: defaultBackground,
  },
  about: {
    text: 'About',
    subtitle: 'A learner building a long-term body of work.',
    backgroundImage: defaultBackground,
  },
  postDefaultBackground: defaultBackground,
};
