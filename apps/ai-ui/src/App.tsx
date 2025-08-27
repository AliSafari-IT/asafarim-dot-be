import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { LayoutContainer, FooterContainer } from "@asafarim/shared-ui-react";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "@asafarim/react-themes";
import Root from "./theme/Root";




export default function App() {
  // Cross-app theme sync: mirror theme between localStorage and a root-domain cookie
  useEffect(() => {
    const THEME_KEY = "asafarim-theme";
    const COOKIE_NAME = "asafarim_theme";

    const getCookie = (name: string) =>
      document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(name + "="))
        ?.split("=")[1];

    const cookieTheme = getCookie(COOKIE_NAME);
    if (cookieTheme) {
      localStorage.setItem(THEME_KEY, cookieTheme);
    }

    let last = localStorage.getItem(THEME_KEY) || cookieTheme || "dark";

    const writeCookie = (value: string) => {
      document.cookie = `${COOKIE_NAME}=${value}; domain=.asafarim.local; path=/; max-age=31536000; samesite=lax`;
    };

    const interval = setInterval(() => {
      const current = localStorage.getItem(THEME_KEY);
      if (current && current !== last) {
        last = current;
        writeCookie(current);
      }
    }, 1000);

    const onVis = () => {
      if (!document.hidden) {
        const v = getCookie(COOKIE_NAME);
        if (v && v !== localStorage.getItem(THEME_KEY)) {
          localStorage.setItem(THEME_KEY, v);
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <ThemeProvider
      defaultMode="dark"
      storageKey="asafarim-theme"
      persistMode={true}
    >
      <Root>
        <LayoutContainer
          footer={<FooterContainer key={"main footer"} />}
          header={<Navbar key={"main header"} />}
          title="Generate Resume"
        >
          <Outlet />
        </LayoutContainer>
      </Root>
    </ThemeProvider>
  );
}


