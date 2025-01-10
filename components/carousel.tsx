"use client";

import React, { useState, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";

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
  const [selectedBook, setSelectedBook] = useState<number | null>(null); // Track selected book
  const clickLock = useRef(false); // Prevent double clicks

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
      const angle = index * angularSpacing; // Base angle for book
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);

      // Rotate the book to always face the center of the circle
      const rotationY = -angle; // Ensure books face inward

      return {
        position: [x, 0, z] as [number, number, number],
        rotation: [0, rotationY, 0] as [number, number, number], // Upright and facing inward
      };
    });
  }, []);

  // Handle book click
  const handleBookClick = (index: number) => {
    if (clickLock.current) return; // Prevent multiple clicks
    clickLock.current = true;

    console.log("Selected book", index);
    console.log("Book texture", books[index].texture);

    setSelectedBook(index); // Set the selected book

    setTimeout(() => {
      clickLock.current = false; // Unlock after a brief delay
    }, 500);
  };

  // Handle returning to the carousel
  const handleBackToCarousel = () => {
    setSelectedBook(null); // Deselect the book
  };

  return (
    <Canvas camera={{ position: [0, 0, 25], fov: 65 }} shadows>
      <OrbitControls
        enabled={selectedBook === null} // Disable controls when a book is selected
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        enablePan={false}
        enableZoom={false}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} castShadow />
      {bookPositions.map((book, index) => {
        if (selectedBook === null || selectedBook === index) {
          const isSelected = selectedBook === index;

          return (
            <Book
              key={index}
              position={
                isSelected
                  ? [0, 0, 5] // Bring the selected book to the front
                  : book.position
              }
              rotation={
                isSelected
                  ? [0, 0, 0] // Ensure the cover faces forward
                  : book.rotation
              }
              textureUrl={books[index].texture}
              onClick={() => handleBookClick(index)}
            />
          );
        }
        return null;
      })}

      {/* Add the 3D object for returning to the carousel */}
      {selectedBook !== null && (
        <mesh
          position={[10, 10, 8]} // Position in front of the camera
          onClick={handleBackToCarousel}
        >
          <sphereGeometry args={[0.5, 32, 32]} />{" "}
          {/* Replace with your 3D object */}
          <meshStandardMaterial color="orange" emissive="yellow" />
        </mesh>
      )}
    </Canvas>
  );
};
