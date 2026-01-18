"use client";

import { useRouter } from "next/navigation";
import { Silkscreen } from "next/font/google";

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function StartHackingButton() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/hackathon");
  };

  return (
    <button
    onClick={handleEnter}
    className={`
        bg-[#4A3F35] hover:bg-[#614f3f]
        text-white font-bold
        text-2xl
        ${silkscreen.className}
        px-6 py-4
        mt-10
        rounded-lg transition
        cursor-pointer
    `}
    >
        Start Hacking
    </button>

  );
}