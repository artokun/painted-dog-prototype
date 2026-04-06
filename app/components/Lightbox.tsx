"use client";
import { Dialog } from "@base-ui/react/dialog";
import { HTMLAttributes, useState } from "react";

type LightboxProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  content?: React.ReactNode;
} & HTMLAttributes<HTMLButtonElement>;

export const Lightbox = ({
  children,
  title = "Lightbox",
  description,
  content,
  ...props
}: LightboxProps) => {
  const [open, setOpen] = useState(false);
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger {...props}>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="bg-background/50 backdrop-blur-[80px]" />
        <Dialog.Popup className="w-[90%] max-w-[1000px]">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {description}
          </Dialog.Description>
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>{description}</div>
            <Dialog.Close>Close</Dialog.Close>
            <div>{content}</div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
