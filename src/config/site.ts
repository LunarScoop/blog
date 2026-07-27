/**
 * Site-level settings shared by header, SEO tags, and feed generation.
 */
export interface SiteConfig {
  /**
   * Canonical production URL of this site.
   */
  siteUrl: string;
  /**
   * Global site title used in header and metadata.
   */
  siteTitle: string;
  /**
   * Optional suffix appended to browser/SEO page titles.
   */
  siteTitleSuffix: string;
  /**
   * Default site description used by index and RSS metadata.
   */
  siteDescription: string;
  /**
   * BCP-47 locale tag (for example: zh-CN, en-US).
   */
  locale: string;
  /**
   * IANA timezone used for publication-date grouping and display.
   */
  siteTimeZone: string;
  /**
   * Repository URL shown in the header action area.
   */
  headerGithubRepoUrl: string;
  /**
   * Global favicon ico path served from the public directory.
   */
  faviconIco: string;
}

export const siteConfig: SiteConfig = {
  siteUrl: 'http://localhost:4321',
  siteTitle: 'LunarScoop',
  siteTitleSuffix: '个人博客',
  siteDescription: '一个记录数学、计算机、项目实践与学习思考的个人博客。',
  locale: 'zh-CN',
  siteTimeZone: 'Asia/Shanghai',
  headerGithubRepoUrl: 'https://github.com/LunarScoop',
  faviconIco: '/favicon.svg?v=2',
};

export const {
  siteUrl,
  siteTitle,
  siteTitleSuffix,
  siteDescription,
  locale,
  siteTimeZone,
  headerGithubRepoUrl,
  faviconIco,
} = siteConfig;
