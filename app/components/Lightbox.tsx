"use client";
import { Dialog } from "@base-ui/react/dialog";
import { HTMLAttributes, useState } from "react";
import { CloseIcon } from "./icons/Close";

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
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger {...props}>{children}</Dialog.Trigger>
      <Dialog.Portal className="fixed inset-0 z-1000 flex max-h-dvh items-center justify-center overflow-hidden text-black">
        <Dialog.Backdrop className="bg-background/50 fixed inset-0 cursor-pointer backdrop-blur-[80px]" />
        <Dialog.Popup className="relative z-2 mx-auto max-h-full w-[90%] max-w-[1000px] overflow-y-scroll">
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
    </Dialog.Root>
  );
};
