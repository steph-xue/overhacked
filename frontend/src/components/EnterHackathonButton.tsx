"use client";

import { useState } from "react";
import PopupForm from "./PopupForm";

export default function EnterHackathonButton() {

    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 rounded-lg border border-black bg-black hover:bg-gray-500 hover:text-white transition"
        >
          Enter Hackathon
        </button>
  
        {isOpen && <PopupForm onClose={() => setIsOpen(false)} />}
      </>
    );
}
