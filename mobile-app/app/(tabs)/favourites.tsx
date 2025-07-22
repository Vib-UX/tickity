import React, { useState } from "react";
import { Button, Text, View } from "react-native";
import ARApp from "../../components/ar";

const Favourites = () => {
  const [showAR, setShowAR] = useState(false);

  if (showAR) {
    return <ARApp />;
  }
  return (
    <View>
      <Text>Favourites</Text>
      <Button
        title="Show AR"
        onPress={() => {
          setShowAR(true);
        }}
      />
    </View>
  );
};

export default Favourites;
