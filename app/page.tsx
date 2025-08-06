"use client";

import AuthGate from "./components/AuthGate";
import { Background } from "./components/Background";
import { Middle } from "./components/Middle";
import { Foreground } from "./components/Foreground";

export default function Home() {
  return (
    <AuthGate>
      <main className="h-dvh w-screen relative">
        <Background />
        <Middle />
        <Foreground />
      </main>
    </AuthGate>
  );
}
