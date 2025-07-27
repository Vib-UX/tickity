import React, { useState } from "react";
import { Button, Text, View } from "react-native";
const Favourites = () => {
  const [showAR, setShowAR] = useState(false);

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
