import ThirdwebScreen from "@/components/ThirdwebScreen";
import { StyleSheet } from "react-native";

import { View } from "react-native";

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <ThirdwebScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
