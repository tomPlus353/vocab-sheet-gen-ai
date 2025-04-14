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

//lucide sparkle
import { BookType, Sparkles } from "lucide-react";

import CheatSheet from "./Cheatsheet";
import { SP } from "next/dist/shared/lib/utils";

interface Props {
  activeText: string[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<Props> = (props: Props) => {
  //modal
  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogTrigger className="ml-auto w-auto rounded-xl border-2 border-solid border-blue-100/20 bg-blue-500/20 px-3 py-2 hover:bg-blue-500">
        <div className="flex flex-row">
          <Sparkles className="mr-2 h-5 w-5" />
          <span>Cheatsheet</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] max-w-[90%] overflow-y-auto bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-blue-300 text-2xl flex flex-row items-center">
            <BookType className="h-5 w-5" />
            Cheatsheet
          </DialogTitle>
          <DialogDescription className="text-white">

            A quick overview of difficult vocab and grammar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col">
          {/* render cheatsheet here */}
          <CheatSheet activeText={props.activeText.join("\n")} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
