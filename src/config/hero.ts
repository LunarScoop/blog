import defaultBackground from '../assets/blog-placeholder-1.webp';

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
  backgroundImage: string;
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
  postDefaultBackground: string;
}

export const heroConfig: HeroConfig = {
  home: {
    text: 'Learn, build, and write.',
    subtitle: 'Mathematics, computer science, and projects in progress.',
    backgroundImage: defaultBackground.src,
  },
  blog: {
    text: 'Blog',
    subtitle: 'Notes, thoughts, and what I am learning.',
    backgroundImage: defaultBackground.src,
  },
  projects: {
    text: 'Projects_',
    subtitle: "Things I've built and explored.",
    backgroundImage: defaultBackground.src,
  },
  tags: {
    text: 'Tags',
    subtitle: 'Explore topics by category and tag.',
    backgroundImage: defaultBackground.src,
  },
  about: {
    text: 'About',
    subtitle: 'A learner building a long-term body of work.',
    backgroundImage: defaultBackground.src,
  },
  postDefaultBackground: defaultBackground.src,
};
