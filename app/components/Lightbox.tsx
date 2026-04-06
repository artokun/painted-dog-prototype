"use client";
import { Dialog, DialogRootActions } from "@base-ui/react/dialog";
import gsap from "gsap";
import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { CloseIcon } from "./icons/Close";
import { cn } from "@/lib/utils";

gsap.config({ nullTargetWarn: false });

type LightboxProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  lightboxContent: React.ReactNode;
} & HTMLAttributes<HTMLButtonElement>;

export const Lightbox = ({
  children,
  title = "Lightbox",
  description,
  lightboxContent,
  ...props
}: LightboxProps) => {
  const [open, setOpen] = useState(false);
  const actionsRef = useRef<DialogRootActions>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const handleEnterAnimation = () => {
    setOpen(true);
    requestAnimationFrame(() => {
      if (!backdropRef.current || !popupRef.current) return;
      gsap.killTweensOf([backdropRef.current, popupRef.current]);
      gsap.to(backdropRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        popupRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    });
  };

  const handleExitAnimation = () => {
    gsap.killTweensOf([backdropRef.current, popupRef.current]);
    gsap.to(backdropRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(popupRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        actionsRef.current?.unmount?.();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          handleEnterAnimation();
        } else {
          handleExitAnimation();
        }
      }}
      actionsRef={actionsRef}
    >
      <Dialog.Trigger {...props}>{children}</Dialog.Trigger>
      {open && (
        <Dialog.Portal
          ref={portalRef}
          keepMounted={true}
          className={cn(
            "fixed inset-0 z-1000 flex max-h-dvh items-center justify-center overflow-hidden text-black"
          )}
        >
          <Dialog.Backdrop
            ref={backdropRef}
            className="bg-background/50 fixed inset-0 cursor-pointer opacity-0 backdrop-blur-[80px]"
          />
          <Dialog.Popup
            ref={popupRef}
            className="relative z-2 mx-auto max-h-full w-[90%] max-w-[1000px] overflow-y-scroll opacity-0"
          >
            <Dialog.Description className="sr-only">
              {description}
            </Dialog.Description>
            <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3">
              <Dialog.Title className="text-[1.125rem] leading-[120%] font-medium">
                {title}
              </Dialog.Title>
              <Dialog.Close className="flex h-[1.63rem] w-[1.63rem] cursor-pointer items-center justify-center">
                <span className="sr-only">Close</span>
                <CloseIcon className="h-6 w-6" />
              </Dialog.Close>
              <div className="shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]">
                {lightboxContent}
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
};
