'use client";	'
import React from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

//lucide sparkle
import { BookType, Sparkles, RefreshCcw, Gamepad } from "lucide-react";

import CheatSheet from "./Cheatsheet";
import CommonButton from "@/components/common/CommonButton";

interface Props {
  activeText: string[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<Props> = (props: Props) => {
  const router = useRouter();

  const handleGoMatch = () => {
    
    try {
      router.push("/match", undefined);
    } catch (e) {
      console.log("Error pushing to match page: ", e);
    }
  }

  //modal
  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogTrigger className="ml-auto w-auto rounded-xl border-2 border-solid border-blue-100/20 bg-blue-500/20 px-3 py-2 hover:bg-blue-500">
        <div className="flex flex-row">
          <Sparkles className="mr-2 h-5 w-5" />
          <span>Cheatsheet</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] max-w-[90%] overflow-y-auto bg-slate-900 text-white [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center text-2xl text-blue-300">
            <BookType className="h-5 w-5" />
            Cheatsheet
          </DialogTitle>
          <DialogDescription className="text-white">
            A quick overview of difficult vocab and grammar.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="vocab" className="flex w-full flex-col">
          <TabsList className="mb-2 mr-auto bg-slate-800">
            <TabsTrigger
              value="vocab"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              vocab
            </TabsTrigger>
            <TabsTrigger
              value="grammar"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              grammar
            </TabsTrigger>
          </TabsList>
          {/* render cheatsheet here */}
          <TabsContent value="vocab">
            <CheatSheet
              activeText={props.activeText.join("\n")}
              mode={"vocab"}
            />
          </TabsContent>
          <TabsContent value="grammar">
            <CheatSheet
              activeText={props.activeText.join("\n")}
              mode={"grammar"}
            />
          </TabsContent>
          <div className="ml-auto flex flex-row items-end">
            <CommonButton
              label=""
              additionalclasses="ml-auto h-10 w-10 flex flex-row items-center px-0 py-0"
              onClick={handleGoMatch}
            >
              <Gamepad className="m-auto h-5 w-5" />
            </CommonButton>
            <CommonButton
              label=""
              additionalclasses="ml-auto h-10 w-10 flex flex-row items-center px-0 py-0"
            >
              <RefreshCcw className="m-auto h-5 w-5" />
            </CommonButton>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
