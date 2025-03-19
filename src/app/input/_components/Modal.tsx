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

import CheatSheet from "./Cheatsheet";

interface Props {
  activeText: string[];
}

const Modal = ({ activeText }: Props, children: React.ReactNode) => {
  //modal
  return (
    <Dialog>
      <DialogTrigger className="ml-auto w-[20%] rounded-xl bg-blue-500/20 px-4 py-2 text-sm hover:bg-blue-500">
        {" "}
        Show Breakdown
      </DialogTrigger>
      <DialogContent className="h-[95%] min-h-[95%] w-[95%] min-w-[95%]">
        <DialogHeader>
          <DialogTitle>Cheatsheet</DialogTitle>
          <DialogDescription>
            A quick overview of difficult vocab and grammar.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[95%] overflow-y-auto">
          {/* render cheatsheet here */}
          <CheatSheet activeText={activeText.join("\n")} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
