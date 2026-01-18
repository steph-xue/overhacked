import { Silkscreen } from "next/font/google";
import StartHackingButton from "@/components/StartHackingButton";

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center text-black">
      <h1 className={`text-8xl font-bold mb-6 ${silkscreen.className} text-[#4A3F35]`}>
        Overhacked
      </h1>
      <StartHackingButton />
    </main>
  );
}