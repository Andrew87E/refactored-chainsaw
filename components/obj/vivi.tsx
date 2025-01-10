"use client";

import React, { useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

export const Vivi = () => {
  // Manage state for the loaded GLTF model
  const [viviModel, setViviModel] = useState<THREE.Group | null>(null);

  // Load GLTF model using useEffect
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      "/models/scene.gltf", // Path to the .gltf file
      (gltf) => {
        setViviModel(gltf.scene); // Set the loaded model to state
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded"); // Progress
      },
      (error) => {
        console.error("An error occurred:", error);
      }
    );
  }, []);

  // Render the 3D model and additional meshes
  return (
    <group>
      {viviModel && (
        <primitive
          object={viviModel}
          position={[12, -10, -10]} // Adjust position
          rotation={[0, -1, 0]} // Adjust rotation
          scale={[4, 4, 4]} // Adjust scale
        />
      )}
    </group>
  );
};
