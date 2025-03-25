import React from "react";
import {
  Dialog,
  DialogContent,
  // DialogOverlay,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import CheatSheet from "./Cheatsheet";

interface Props {
  activeText: string[];
}

const Modal = ({ activeText }: Props) => {
  //modal
  return (
    <Dialog>
      <DialogTrigger className="ml-auto w-auto rounded-xl border-2 border-solid border-blue-100/20 bg-blue-500/20 px-3 py-2 hover:bg-blue-500">
        {" "}
        Show Breakdown
      </DialogTrigger>
      <DialogContent className="min-h-[95%] min-w-[95%]">
        <DialogHeader>
          <DialogTitle>Cheatsheet</DialogTitle>
          <DialogDescription>
            A quick overview of difficult vocab and grammar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[95%] flex-col overflow-y-auto">
          {/* render cheatsheet here */}
          <CheatSheet activeText={activeText.join("\n")} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
