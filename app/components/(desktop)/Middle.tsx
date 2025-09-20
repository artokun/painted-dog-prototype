"use client";

import { Scroll, ScrollControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import App from "./App";
import * as THREE from "three";
import { Suspense } from "react";
import { Footer } from "../Footer";
import { cn } from "@/lib/utils";
import { bookStore } from "@/app/store/bookStore";
import { useSnapshot } from "valtio";
import { PDButton } from "../ui/PDButton";
import { AddToCalendarButton } from "../ui/AddToCalendarButton";
import { NewsletterForm } from "../ui/NewsletterForm";

export const Middle = () => {
  return (
    <div id="middle" className="absolute inset-0 top-0 left-0 z-10">
      <Canvas
        camera={{ position: [0, 0.01, 0.3], fov: 45 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.LinearToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMappingExposure: 1.0,
          powerPreference: "high-performance",
          // depth: false,
          alpha: false,
        }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={1.75} damping={0.1}>
            <App />
            <Scroll html>
              <TempAcceleratedContent />
              <Footer />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </div>
  );
};

const TempAcceleratedContent = () => {
  const { focusedBookId } = useSnapshot(bookStore);
  const someBookIsFocused = focusedBookId !== null;

  return (
    <section
      className={cn(
        "relative max-w-6xl mx-auto top-[calc(75vh)] h-[100dvh] text-black flex flex-col gap-10 p-4 transition-opacity duration-300",
        someBookIsFocused && "opacity-0 pointer-events-none"
      )}
    >
      <div className="flex gap-10 justify-around max-w-3xl mx-auto">
        <p className="flex-1 text-lg font-medium">
          An expansive publication in full colour showcasing decades' worth of
          illustration done in hundreds of sketchbooks and journals by the
          creators of the biting satirical comic Bitterkomix.
        </p>
        <div className="flex-1 gap-3 flex flex-col">
          <h3 className="text-2xl font-bold">Stellenbosch Woordfees</h3>
          <p className="text-md">
            The collection will be launching on September 18th at the
            Stellenbosch Woordfees.
          </p>
          <div>
            <AddToCalendarButton
              event={{
                title: "Bitterkomix Launch - Stellenbosch Woordfees",
                start: "20250918T100000Z",
                end: "20250918T120000Z",
                description:
                  "Launch of Bitterkomix Sketchbooks and Journals at Stellenbosch Woordfees",
                location: "Stellenbosch, South Africa",
              }}
            >
              Add to calendar
            </AddToCalendarButton>
          </div>
          <div className="flex flex-wrap gap-3">
            <PDButton primary>Buy the book</PDButton>
            <PDButton>Buy: Takealot</PDButton>
            <PDButton>Buy: Exclusive Books</PDButton>
          </div>
        </div>
      </div>
      <div className="border-b border-black w-full max-w-[400px] mx-auto h-[1px] py-3" />
      <h1 className="text-5xl font-medium text-center pt-6">
        Painted Dog Press Launch
      </h1>
      <div className="flex gap-10">
        <article className="flex-1 flex flex-col gap-3">
          <h3 className="text-xl font-medium">New Publisher, New Tricks</h3>
          <p>
            Painted Dog Press is a new independent book publisher of fiction and
            non-fiction. Spearheaded by Fourie Botha (previously from Penguin
            Random House SA) and John Hunt (TBWA/Hunt/Lascaris), the press will
            develop and nurture quality literature and provide writers with a
            publishing house that continually fosters and markets their work.
            Painted Dog's efforts will be strengthened by tech innovation and
            human-first technology.
          </p>
        </article>
        <article className="flex-1 flex flex-col gap-3">
          <h3 className="text-xl font-medium">&nbsp;</h3>
          <p>
            The launch of Bitterkomix at Stellenbosch Woordfees, simultaneously
            launches Painted Dog Press.
          </p>
          <p>
            Come and enjoy what Anton and Conrad have planned –{" "}
            <strong>and</strong> meet the team that has brought Painted Dog to
            life.
          </p>
        </article>
        <article className="flex-1 flex flex-col gap-3">
          <h3 className="text-xl font-medium">Win a copy, be in the know</h3>
          <p className="text-sm">
            Receive updates on page-turning developments and future publications
            in our newsletter and stand a chance to win a copy of Bitterkomix
            Sketchbooks and Journals.
          </p>
          <NewsletterForm />
        </article>
      </div>
    </section>
  );
};
