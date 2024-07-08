// src/app/components/utility/theme.ts

let theme = "light";
export function setTheme(isTheme: boolean) {
  theme = isTheme ? "light" : "dark";
}

export function getTheme() {
  return (theme == 'light') ? true : false;
}