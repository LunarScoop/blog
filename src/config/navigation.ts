export interface NavigationItem {
  label: string;
  href: string;
}

export const NAVIGATION: readonly NavigationItem[] = [
  { label: "Home", href: "/" },
  { label: "Learn", href: "/learn" },
  { label: "Projects", href: "/projects" },
  { label: "Thoughts", href: "/thoughts" },
  { label: "About", href: "/about" },
];
