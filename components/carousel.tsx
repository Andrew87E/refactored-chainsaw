"use client";

import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

export const Book = ({
  position,
  rotation,
  textureUrl,
  onClick,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  textureUrl: string;
  onClick: () => void;
}) => {
  const originalModel = useFBX("/models/book.fbx"); // Load the 3D model
  const texture = useTexture(textureUrl); // Load the texture

  // Clone the model for each instance
  const bookModel = useMemo(() => originalModel.clone(), [originalModel]);

  // Traverse the model to apply the texture to all meshes
  bookModel.traverse((child: any) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({ map: texture }); // Apply texture
      child.castShadow = true; // Enable shadows
      child.receiveShadow = true;
    }
  });

  // Correct the initial orientation of the book (spine vertical, cover forward)
  const globalRotationCorrection = new THREE.Euler(0, 3, 1.4); // Adjust for upright alignment

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      <primitive
        object={bookModel}
        rotation={globalRotationCorrection} // Apply global correction
        scale={[0.3, 0.3, 0.3]} // Adjust scale
      />
    </group>
  );
};

export const Carousel = () => {
  const radius = 12; // Radius of the carousel
  const [rotationOffset, setRotationOffset] = useState(0); // Track rotation offset
  const [locked, setLocked] = useState(false); // Allow rotation by default

  const books = [
    { texture: "/textures/book/Book_Albedo2.png" },
    { texture: "/textures/book/Book-Albedo.png" },
    { texture: "/textures/book/Book_Albedo3.png" },
    { texture: "/textures/book/Book_Albedo4.png" },
    { texture: "/textures/book/Book_Albedo5.png" },
    { texture: "/textures/book/Book_Albedo3.png" },
    { texture: "/textures/book/Book_Albedo4.png" },
    { texture: "/textures/book/Book_Albedo5.png" },
  ];

  const angularSpacing = (2 * Math.PI) / books.length; // Space books equally in a circle

  // Calculate positions and rotations for books dynamically
  const bookPositions = useMemo(() => {
    return books.map((_, index) => {
      const angle = index * angularSpacing + rotationOffset; // Adjust angle dynamically
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Rotate the book to always face the center of the circle
      const rotationY = -angle; // Ensure books face inward

      return {
        position: [x, 0, z] as [number, number, number],
        rotation: [0, rotationY, 0] as [number, number, number], // Upright and facing inward
      };
    });
  }, [rotationOffset]);

  // Handle book click
  const handleBookClick = (index: number) => {
    setLocked(true); // Lock the carousel while rotating
    const targetRotationOffset = -index * angularSpacing; // Calculate rotation needed to align the book
    gsap.to(
      { rotation: rotationOffset },
      {
        rotation: targetRotationOffset,
        duration: 1.5,
        onUpdate: function () {
          setRotationOffset(this.targets()[0].rotation); // Update rotation state
        },
        onComplete: () => setLocked(false), // Unlock carousel after rotation
        ease: "power3.out",
      }
    );
  };

  return (
    <Canvas camera={{ position: [0, 0, 25], fov: 65 }} shadows>
      <OrbitControls
        enabled={!locked} // Enable controls unless locked
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        enablePan={false}
        enableZoom={false}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} castShadow />
      {bookPositions.map((book, index) => (
        <Book
          key={index}
          position={book.position}
          rotation={book.rotation}
          textureUrl={books[index].texture}
          onClick={() => handleBookClick(index)} // Pass book index to click handler
        />
      ))}
    </Canvas>
  );
};
