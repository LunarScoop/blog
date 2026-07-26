import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineEcConfig } from "astro-expressive-code";

export default defineEcConfig({
  defaultLocale: "zh-CN",
  themes: ["github-light", "github-dark"],
  useDarkModeMediaQuery: false,
  customizeTheme(theme) {
    theme.name = theme.type === "dark" ? "dark" : "light";
  },
  plugins: [pluginLineNumbers()],
  defaultProps: {
    showLineNumbers: true,
  },
});
