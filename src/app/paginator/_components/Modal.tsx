'use client";	';
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
import {
    BookType,
    RefreshCcw,
    Gamepad,
    NotepadText,
    Orbit,
} from "lucide-react";

import { CheatSheet } from "./Cheatsheet";
import CommonButton from "@/components/common/CommonButton";

interface Props {
    activeText: string[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<Props> = (props: Props) => {
    const router = useRouter();
    const [refreshSignal, setRefreshSignal] = React.useState<number>(0);

    const handleGoMatch = () => {
        try {
            router.push("/match", undefined);
        } catch (e) {
            console.log("Error pushing to match page: ", e);
        }
    };

    const handleGoGravity = () => {
        try {
            router.push("/gravity", undefined);
        } catch (e) {
            console.log("Error pushing to gravity page: ", e);
        }
    };

    const handleRefreshSignal = () => {
        setRefreshSignal((prev) => prev + 1);
    };

    //modal
    return (
        <Dialog open={props.open} onOpenChange={props.setOpen}>
            <DialogTrigger className="has-tooltip relative ml-auto w-full md:w-auto rounded-xl border-2 border-solid border-blue-100/20 bg-blue-500/20 px-3 py-2 hover:bg-blue-500 shrink">
                <span className='tooltip absolute right-0 bottom-full rounded shadow-lg p-1 bg-black text-white text-sm -mt-8'>Generate vocab and grammar list</span>
                <div className="flex flex-row">
                    <NotepadText className="mx-auto md:mr-2 h-5 w-5" />
                    <span className="hidden md:inline" >Cheatsheet</span>
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
                            signal={refreshSignal}
                        />
                    </TabsContent>
                    <TabsContent value="grammar">
                        <CheatSheet
                            activeText={props.activeText.join("\n")}
                            mode={"grammar"}
                            signal={refreshSignal}
                        />
                    </TabsContent>
                    <div className="ml-auto flex flex-row items-end">
                        <CommonButton
                            label=""
                            additionalclasses="ml-auto h-10 w-10 flex flex-row items-center px-0 py-0 has-tooltip relative"
                            onClick={handleGoMatch}
                        >
                            <span className='tooltip absolute right-0 bottom-full rounded shadow-lg p-1 bg-black text-white text-sm -mt-8 -mr-8'>Review with game</span>
                            <Gamepad className="m-auto h-5 w-5" />
                        </CommonButton>
                        <CommonButton
                            label=""
                            additionalclasses="ml-auto h-10 w-10 flex flex-row items-center px-0 py-0 has-tooltip relative"
                            onClick={handleGoGravity}
                        >
                            <span className='tooltip absolute right-0 bottom-full rounded shadow-lg p-1 bg-black text-white text-sm -mt-8 -mr-8'>Gravity typing game</span>
                            <Orbit className="m-auto h-5 w-5" />
                        </CommonButton>
                        <CommonButton
                            label=""
                            additionalclasses="ml-auto h-10 w-10 flex flex-row items-center px-0 py-0 has-tooltip relative"
                            onClick={handleRefreshSignal}
                        >
                            <span className='tooltip absolute right-0 bottom-full rounded shadow-lg p-1 bg-black text-white text-sm -mt-8 -mr-8'>Regenerate</span>
                            <RefreshCcw className="m-auto h-5 w-5" />
                        </CommonButton>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default Modal;
