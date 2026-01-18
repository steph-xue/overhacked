"use client";

import { Silkscreen } from "next/font/google";
import { useState } from "react";
import PopupForm from "./PopupForm";

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function StartHackingButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <button 
          onClick={() => setIsOpen(true)}
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
          Enter Hackathon
        </button>

        {isOpen && <PopupForm onClose={() => setIsOpen(false)} />}
      </>
    );
}
