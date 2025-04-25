export const Theme = { LIGHT: "light", DARK: "dark" };

export function getInitialTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme;
  }

  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? Theme.DARK
    : Theme.LIGHT;
}

export function setTheme(theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
  console.log("Theme set to:", theme);

  const colors = {
    light: {
      background: "#ffffff",
      text: "#1a1a1a",
      primary: "#4a90e2",
      secondary: "#f5f5f5",
      link: "#2c3e50",
      "link-hover": "#2c3e50",
    },
    dark: {
      background: "#1a1a1a",
      text: "#ffffff",
      primary: "#64b5f6",
      secondary: "#333333",
      link: "#ffffff",
      "link-hover": "#2c3e50",
    },
  };

  const currentColors = colors[theme];
  Object.entries(currentColors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}-color`, value);
  });
}
