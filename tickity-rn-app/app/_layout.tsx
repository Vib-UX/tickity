import ErrorBoundary from "@/components/ErrorBoundary";
import ThirdwebWrapper from "@/components/ThirdwebWrapper";
import { useColorScheme } from "@/components/useColorScheme";
import { validateEnvironmentVariables } from "@/utils/envValidation";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { PortalProvider } from "@gorhom/portal";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error("Font loading error:", error);
      // Don't throw the error, just log it and continue
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  // const [configError, setConfigError] = useState<string | null>(null);

  const queryClient = new QueryClient();

  // // Check for required environment variables
  // useEffect(() => {
  //   const validation = validateEnvironmentVariables();
  //   if (!validation.isValid) {
  //     console.error("Environment validation failed:", validation.message);
  //     setConfigError(validation.message);
  //   }
  // }, []);

  // if (configError) {
  //   return (
  //     <ThirdwebWrapper>
  //       <ThemeProvider
  //         value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
  //       >
  //         <GestureHandlerRootView style={{ flex: 1 }}>
  //           <PortalProvider>
  //             <QueryClientProvider client={queryClient}>
  //               <Stack>
  //                 <Stack.Screen
  //                   name="(tabs)"
  //                   options={{ headerShown: false }}
  //                 />
  //               </Stack>
  //             </QueryClientProvider>
  //           </PortalProvider>
  //         </GestureHandlerRootView>
  //       </ThemeProvider>
  //     </ThirdwebWrapper>
  //   );
  // }

  return (
    <ThirdwebWrapper>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PortalProvider>
            <QueryClientProvider client={queryClient}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </QueryClientProvider>
          </PortalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </ThirdwebWrapper>
  );
}
