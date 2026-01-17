import EnterHackathonButton from "@/components/EnterHackathonButton";

export default function Home() {
  return (
    <main className="h-screen flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-semibold mb-6">
        Overhacked
      </h1>
      <EnterHackathonButton />
    </main>
  );
}