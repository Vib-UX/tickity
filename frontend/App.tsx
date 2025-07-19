import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import { AR } from "expo-three-ar";
import React, { useRef } from "react";
import { View } from "react-native";
import * as THREE from "three";

export default function App() {
  const glRef = useRef();

  const onContextCreate = async (gl) => {
    AR.startAsync(gl);
    glRef.current = gl;

    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = AR.getCameraAsync();

    // Add light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 2);
    scene.add(light);

    // Add spinning cube
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.z = -0.5;
    scene.add(cube);

    // Animation loop
    const render = () => {
      requestAnimationFrame(render);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
  };

  return (
    <View style={{ flex: 1 }}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
}
