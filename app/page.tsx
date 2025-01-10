import { Carousel } from "@/components";

export default function Home() {
  return (
    <div className="w-full h-screen bg-parchment text-leather flex justify-center items-center">
      <h1 className="absolute top-10 text-4xl font-bold">
        {" "}
        Welcome to My Portfolio{" "}
      </h1>
      <Carousel />
    </div>
  );
}
