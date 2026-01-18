"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface PopupFormProps {
  onClose: () => void;
}

interface PopupFormData {
  name: string;
  yearsOfExperience: number
  favouriteLanguage: string;
}

interface yearsOfExperienceOption {
  value: number
  label: number
}

export default function PopupForm({ onClose }: PopupFormProps) {
  const router = useRouter();

    const [formData, setFormData] = useState<PopupFormData>({
    name: "",
    yearsOfExperience: 1,
    favouriteLanguage: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Hackathon entry:", formData);
    onClose();
    router.push("/hackathon");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white text-black rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Hackathon Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-black text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full text-black"
              placeholder="Your Name"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black text-sm mb-1">Years of Experience</label>
            <input
              type="text"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full text-black"
              placeholder="Years"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-black text-sm mb-1">Favourite Language</label>
            <input
              type="text"
              name="favouriteLanguage"
              value={formData.favouriteLanguage}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full text-black"
              placeholder="Language"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-black text-white"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}