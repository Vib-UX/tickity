// Fast refresh doesn't work very well with GLViews.
// Always reload the entire component when the file changes:
// https://reactnative.dev/docs/fast-refresh#fast-refresh-and-hooks
// @refresh reset

import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import { loadAsync, Renderer, TextureLoader, THREE } from "expo-three";
import OrbitControlsView from "expo-three-orbit-controls";
import * as React from "react";
import { View } from "react-native";
import {
  ObjectLoader,
  PerspectiveCamera,
  PointLight,
  Scene,
  SpotLight,
} from "three";
import { LoadingView } from "../components/LoadingView";

const fileName = "Use_a_bold_high_cont_0719082431_refine";
function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const cameraRef = React.useRef<THREE.Camera>();

  const timeoutRef = React.useRef<number>();
  React.useEffect(() => {
    // Clear the animation loop when the component unmounts
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    // removes the warning EXGL: gl.pixelStorei() doesn't support this parameter yet!
    const pixelStorei = gl.pixelStorei.bind(gl);
    gl.pixelStorei = function (...args) {
      const [parameter] = args;
      switch (parameter) {
        case gl.UNPACK_FLIP_Y_WEBGL:
          return pixelStorei(...args);
      }
    };

    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const clearColor = 0xffffff;
    const lightColor = 0xffffff;

    // Create a WebGLRenderer without a DOM element
    const renderer = new Renderer({
      gl,
      clearColor,
      width: width,
      height: height,
    });

    const camera = new PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(2, 5, 5);
    camera.updateProjectionMatrix();
    cameraRef.current = camera;

    const scene = new Scene();

    const pointLight = new PointLight(lightColor, 2 * Math.PI, 1000, 0.0);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);

    const spotLight = new SpotLight(
      lightColor,
      0.5 * Math.PI,
      0,
      Math.PI / 3,
      0,
      0.0
    );
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene.position);
    scene.add(spotLight);

    const loader = new ObjectLoader();
    loader.loadAsync(
      require("../assets/res/" + fileName + ".obj"),
      (object) => {
        console.log("Object loaded successfully:", object);
      }
    );

    const model: Record<string, any> = {
      "3d.obj": require("../assets/res/" + fileName + ".obj"),
      "3d.mtl": require("../assets/res/" + fileName + ".mtl"),
    };

    const object = await loadAsync(
      [model["3d.obj"], model["3d.mtl"]],
      // @ts-ignore
      null,
      (name) => model[name]
    );

    // Load texture synchronously
    const textureLoader = new TextureLoader();
    textureLoader.load(
      require("../assets/res/texture_0.webp"),
      (loadedTexture) => {
        if (object.material) {
          object.material.map = loadedTexture;
          object.material.needsUpdate = true;
        }
      }
    );

    object.scale.set(2, 2, 2);
    scene.add(object);
    camera.lookAt(object.position);

    const render = () => {
      if (isLoading) {
        setIsLoading(false);
      }

      // Rotate the object
      if (object) {
        // object.rotation.y += 0.01; // Rotate around Y-axis
        // You can also add rotation around other axes:
        object.rotation.x += 0.005; // Rotate around X-axis
        object.rotation.z += 0.005; // Rotate around Z-axis
      }

      timeoutRef.current = requestAnimationFrame(render);

      if (cameraRef.current && scene) {
        renderer.render(scene, camera);
      }
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={{ flex: 1 }}>
      <OrbitControlsView style={{ flex: 1 }} camera={cameraRef.current}>
        <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
      </OrbitControlsView>
      {isLoading && <LoadingView />}
    </View>
  );
}

export default App;
