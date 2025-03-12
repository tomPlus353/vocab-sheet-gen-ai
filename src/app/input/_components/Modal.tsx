"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  activeText: string[];
}

const Modal = ({ activeText }: Props) => {
  //modal
  return (
    <Dialog>
      <DialogTrigger className="ml-auto w-[20%] rounded-xl bg-blue-500/20 px-4 py-2 text-sm hover:bg-blue-500">
        {" "}
        Show Breakdown
      </DialogTrigger>
      <DialogContent className="w-[80%] min-w-[80%]">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {/* render cheatsheet here? */}
          {activeText.join("\n")}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
