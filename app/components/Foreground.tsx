"use client";

import { Header } from "./Header";
import { FloatingBar } from "./FloatingBar";
import { Loader } from "@react-three/drei";
import { usePathname, useRouter } from "next/navigation";
import { globalStore } from "../store/globalStore";
import { useEffect } from "react";
import { subscribeKey } from "valtio/utils";

export const Foreground = () => {
  const router = useRouter();
  const pathname = usePathname();

  // This allows us to navigate to the current route when the url changes from
  // inside of the react three fiber app
  useEffect(() => {
    const unsubscribe = subscribeKey(
      globalStore,
      "currentRoute",
      (currentRoute) => {
        if (currentRoute !== pathname) {
          router.push(currentRoute);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center flex-col z-20 pointer-events-none">
      <Header />
      <FloatingBar />
      <Loader />
    </div>
  );
};
