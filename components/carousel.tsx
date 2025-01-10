"use client";

import React, { useState, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useFBX, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Vivi } from "./obj/vivi";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export const Book = ({
  position,
  rotation,
  textureUrl,
  normalMapUrl,
  mixmapsUrl,
  occlusionMapUrl,
  onClick,
  visible,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  textureUrl: string;
  normalMapUrl: string;
  mixmapsUrl: string;
  occlusionMapUrl: string;
  onClick: () => void;
  visible: boolean;
}) => {
  const originalModel = useFBX("/models/book.fbx");
  const texture = useTexture(textureUrl);
  const normalMap = useTexture(normalMapUrl);
  const mixmaps = useTexture(mixmapsUrl);
  const occlusionMap = useTexture(occlusionMapUrl);

  const bookModel = useMemo(() => originalModel.clone(), [originalModel]);

  bookModel.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material = new THREE.MeshStandardMaterial({
        map: texture,
        normalMap,
        aoMap: occlusionMap,
        metalness: 0.5,
        roughness: 0.5,
        metalnessMap: mixmaps,
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const globalRotationCorrection = new THREE.Euler(0, 3, 1.4);

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={onClick}
      visible={visible}
    >
      <primitive
        object={bookModel}
        rotation={globalRotationCorrection}
        scale={[0.3, 0.3, 0.3]}
      />
    </group>
  );
};

export const Carousel = () => {
  const radius = 12;
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [fadeInVivi, setFadeInVivi] = useState<boolean>(false);
  const viviRef = useRef<THREE.Group | null>(null);

  const books = [
    {
      texture: "/textures/book/Book_Albedo2.png",
      normalMap: "/textures/book/Book_Normals2.png",
      mixmaps: "/textures/book/Book_MixMap2.png",
    },
    {
      texture: "/textures/book/Book-Albedo.png",
      normalMap: "/textures/book/Book_Normals.png",
      mixmaps: "/textures/book/Book_MixMap.png",
    },
    {
      texture: "/textures/book/Book_Albedo3.png",
      normalMap: "/textures/book/Book_Normals3.png",
      mixmaps: "/textures/book/Book_MixMap3.png",
    },
    {
      texture: "/textures/book/Book_Albedo4.png",
      normalMap: "/textures/book/Book_Normals4.png",
      mixmaps: "/textures/book/Book_MixMap4.png",
    },
    {
      texture: "/textures/book/Book_Albedo5.png",
      normalMap: "/textures/book/Book_Normals5.png",
      mixmaps: "/textures/book/Book_MixMap5.png",
    },
  ];

  const angularSpacing = (2 * Math.PI) / books.length;

  const bookPositions = useMemo(() => {
    return books.map((_, index) => {
      const angle = index * angularSpacing;
      const x = radius * Math.cos(angle);
      const z = radius * Math.sin(angle);
      const rotationY = -angle;

      return {
        position: [x, 0, z] as [number, number, number],
        rotation: [0, rotationY, 0] as [number, number, number],
      };
    });
  }, [books.length]);

  const handleBookClick = (index: number) => {
    setSelectedBook(index); // Mark the selected book

    // Animate all books
    bookPositions.forEach((book, i) => {
      if (i !== index) {
        // Float away non-selected books
        gsap.to(book.position, {
          x: book.position[0] * 2, // Move further along the x-axis
          z: book.position[2] * 2, // Move further along the z-axis
          y: book.position[1] + 5, // Float upward
          duration: 1.5,
          ease: "power3.out",
        });
      } else {
        // Bring the selected book closer
        gsap.to(book.position, {
          x: 0, // Center it
          z: 5, // Bring forward
          y: 0, // Reset height
          duration: 1.5,
          ease: "power3.out",
          onComplete: () => setFadeInVivi(true), // Show Vivi model after animation
        });
      }
    });
  };

  const handleBackToCarousel = () => {
    setSelectedBook(null);
    setFadeInVivi(false);

    bookPositions.forEach((book, i) => {
      gsap.to(book.position, {
        x: radius * Math.cos(i * angularSpacing),
        z: radius * Math.sin(i * angularSpacing),
        duration: 1.5,
        ease: "power3.out",
      });
    });
  };

  return (
    <Canvas camera={{ position: [0, 0, 25], fov: 65 }} shadows>
      <OrbitControls
        enabled={selectedBook === null}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        enablePan={false}
        enableZoom={false}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[-10, 20, 10]} castShadow />

      {bookPositions.map((book, index) => (
        <Book
          key={index}
          position={book.position}
          rotation={book.rotation}
          textureUrl={books[index].texture}
          normalMapUrl={books[index].normalMap}
          mixmapsUrl={books[index].mixmaps || ""}
          occlusionMapUrl="/textures/book/Book_Occlusion.png"
          onClick={() => handleBookClick(index)}
          visible={selectedBook === null || selectedBook === index}
        />
      ))}

      {fadeInVivi && (
        <group
          ref={viviRef}
          position={[10, 0, 3]}
          visible={fadeInVivi}
          onClick={handleBackToCarousel}
        >
          <Vivi />
        </group>
      )}
    </Canvas>
  );
};
