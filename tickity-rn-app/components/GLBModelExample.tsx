import React from "react";
import GLBModelViewer from "./GLBModelViewer";

export default function GLBModelExample() {
  return (
    <GLBModelViewer
      modelPath="https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf" // Example model URL
      scale={1.5}
      position={[0, -0.5, -2]}
      rotation={[0, 0, 0]}
      enableCamera={true} // Set to false for just 3D viewer without camera
      backgroundColor={0x2c3e50}
      enableRotation={true}
    />
  );
}
