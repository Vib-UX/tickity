import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import ThirdwebScreen from "../ThirdwebScreen";

export interface SignInBottomSheetRef {
  snapToIndex: (index: number) => void;
  close: () => void;
}

const SignInBottomSheet = forwardRef<SignInBottomSheetRef>((props, ref) => {
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["80%"], []);

  useImperativeHandle(ref, () => ({
    snapToIndex: (index: number) => {
      sheetRef.current?.snapToIndex(index);
    },
    close: () => {
      sheetRef.current?.close();
    },
  }));

  // render
  return (
    <Portal>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        handleStyle={styles.handleContainer}
      >
        <LinearGradient
          colors={["#000000", "#1a1a1a", "#2d2d2d"]}
          style={styles.gradientContainer}
        >
          <View style={styles.handleWrapper}>
            <View style={styles.handle} />
          </View>

          <BottomSheetView style={styles.contentContainer}>
            <BottomSheetScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              <ThirdwebScreen />
            </BottomSheetScrollView>
          </BottomSheetView>
        </LinearGradient>
      </BottomSheet>
    </Portal>
  );
});

SignInBottomSheet.displayName = "SignInBottomSheet";

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: "transparent",
    width: 0,
    height: 0,
  },
  handleWrapper: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  gradientContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
});

export default SignInBottomSheet;
