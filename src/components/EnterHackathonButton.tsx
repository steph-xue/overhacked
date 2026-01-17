"use client";

import { useRouter } from "next/navigation";

export default function EnterHackathonButton() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/hackathon");
  };

  return (
    <button
      onClick={handleEnter}
      className="px-6 py-3 rounded-lg border border-black bg-black hover:bg-gray-500 hover:text-white transition"
    >
      Enter Hackathon
    </button>
  );
}