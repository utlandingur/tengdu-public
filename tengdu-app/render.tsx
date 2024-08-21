import { Suspense, useEffect } from "react";
import React from "react";
import renderer from "react-test-renderer";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { render as renderReact } from "@testing-library/react";
import { render } from "@testing-library/react-native";
import { SplashScreen } from "expo-router";
import { renderRouter, screen } from "expo-router/build/testing-library";
import { TamaguiProvider, Text, Theme } from "tamagui";

import { SessionProvider as SessionProviderNative } from "./providers/AuthProvider";
//NOTE - this is causing AuthProviderweb to be called
import { SessionProvider as SessionProviderWeb } from "./providers/AuthProvider.web";
import config from "./tamagui.config";

SplashScreen.preventAutoHideAsync();

const ProviderWrapper = ({ children }: React.PropsWithChildren) => {
  return (
    <TamaguiProvider config={config}>
      <Suspense fallback={<Text>Loading...</Text>}>
        <Theme name={"light"}>
          <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
        </Theme>
      </Suspense>
    </TamaguiProvider>
  );
};

const ProviderWrapperWithAuth = ({ children }: React.PropsWithChildren) => {
  return (
    <SessionProviderNative>
      <TamaguiProvider config={config}>
        <Suspense fallback={<Text>Loading...</Text>}>
          <Theme name={"light"}>
            <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
          </Theme>
        </Suspense>
      </TamaguiProvider>
    </SessionProviderNative>
  );
};

const ProviderWrapperReact = ({ children }: React.PropsWithChildren) => {
  return (
    <TamaguiProvider config={config}>
      <Suspense fallback={<Text>Loading...</Text>}>
        <Theme name={"light"}>
          <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
        </Theme>
      </Suspense>
    </TamaguiProvider>
  );
};

const ProviderWrapperWithAuthReact = ({
  children
}: React.PropsWithChildren) => {
  return (
    <SessionProviderWeb>
      <TamaguiProvider config={config}>
        <Suspense fallback={<Text>Loading...</Text>}>
          <Theme name={"light"}>
            <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
          </Theme>
        </Suspense>
      </TamaguiProvider>
    </SessionProviderWeb>
  );
};

const customRender = (ui, options?) =>
  render(ui, { wrapper: ProviderWrapper, ...options });

const customRouterRender = (ui, url: string, options) =>
  renderRouter({ index: ui }, { wrapper: ProviderWrapper, ...options });

const customRenderWithAuth = (ui, options) =>
  render(ui, { wrapper: ProviderWrapperWithAuth, ...options });

const customRenderReact = (ui, options) =>
  renderReact(ui, { wrapper: ProviderWrapperReact, ...options });

const customRenderWithAuthReact = (ui, options) =>
  renderReact(ui, { wrapper: ProviderWrapperWithAuthReact, ...options });
// re-export everything

// for snapshot testing
export const renderSnapshot = (component) => {
  return renderer.create(<ProviderWrapper>{component}</ProviderWrapper>);
};

// override render method
export { customRender as render };
export { customRenderWithAuth as renderWithAuth };
export { customRenderReact as renderReact };
export { customRenderWithAuthReact as renderWithAuthReact };
export { customRouterRender as renderWithRouter };
