import React from "react";
import { ThreeLink } from "../ThreeLink";
import {
  Instagram,
  Facebook,
  YouTube,
  TikTok,
  XTwitter,
  Bluesky,
} from "@/app/components/icons/social";

function SocialLiniks() {
  return (
    <div className="flex gap-2 mt-2 md:mt-0 mx-auto md:ml-auto justify-center items-center [&>button]:hover:text-gray-500 [&>button]:transition-colors [&svg]:w-full [&svg]:h-full">
      <ThreeLink
        href="https://www.facebook.com/profile.php?id=61581186237434"
        className="w-4.5 h-4.5"
        target="_blank"
      >
        <Facebook />
      </ThreeLink>
      <ThreeLink
        href="https://www.instagram.com/painted_dog_press/"
        className="w-4.5 h-4.5"
        target="_blank"
      >
        <Instagram />
      </ThreeLink>
      <ThreeLink
        href="https://www.youtube.com/@PaintedDogPress"
        className="w-4.5 h-4.5"
        target="_blank"
      >
        <YouTube />
      </ThreeLink>
      <ThreeLink
        href="https://www.tiktok.com/@painteddogpress?lang=en"
        className="w-4.5 h-4.5"
        target="_blank"
      >
        <TikTok />
      </ThreeLink>
      <ThreeLink
        href="https://bsky.app/profile/painteddogpress.bsky.social"
        className="w-4.5 h-4.5"
        target="_blank"
      >
        <Bluesky />
      </ThreeLink>
      <ThreeLink
        href="https://x.com/painteddogpress"
        className="w-4.5 h-4.5"
        target="_blank"
      >
        <XTwitter />
      </ThreeLink>
    </div>
  );
}

export default SocialLiniks;
