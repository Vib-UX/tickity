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

// Alternative usage examples:

// For a local file in assets folder:
export function LocalGLBExample() {
  return (
    <GLBModelViewer
      modelPath={require("../assets/models/my-model.glb")}
      scale={2}
      position={[0, 0, -3]}
      enableCamera={false}
      backgroundColor={0x1a1a1a}
    />
  );
}

// For AR mode with camera background:
export function ARGLBExample() {
  return (
    <GLBModelViewer
      modelPath="path/to/your/model.glb"
      scale={0.5}
      position={[0, 0, -1]}
      enableCamera={true}
      enableRotation={false} // Static model for AR
    />
  );
}
