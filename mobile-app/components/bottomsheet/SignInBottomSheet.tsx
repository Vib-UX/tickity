import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, Text } from "react-native";

export interface SignInBottomSheetRef {
  snapToIndex: (index: number) => void;
  close: () => void;
}

const SignInBottomSheet = forwardRef<SignInBottomSheetRef>((props, ref) => {
  const sheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["50%"], []);

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
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🔥</Text>
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
});

SignInBottomSheet.displayName = "SignInBottomSheet";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
});

export default SignInBottomSheet;
