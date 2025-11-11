"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import CommonButton from "@/components/common/CommonButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageTextModalProps {
    open: boolean;
    text: string;
    onOpenChange: (open: boolean) => void;
    setTextboxFunction?: (text: string) => void;
}

export default function ImageTextModal({ open, onOpenChange, text, setTextboxFunction }: ImageTextModalProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!open) {
            // Reset copied state when modal closes
            setTimeout(() => setIsCopied(false), 200);
            setIsSaved(false);
        }
    }, [open]);

    const handleCopy = async () => {
        if (!navigator.clipboard) {
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Clipboard API not available in this browser.",
            });
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast({
                variant: "success",
                description: "Extracted text copied to clipboard.",
            });
            setTimeout(() => setIsCopied(false), 3000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Could not copy text to clipboard.",
            });
        }
    };

    const handleSave = async () => {
        try {
            if (setTextboxFunction) setTextboxFunction(text)
            setIsCopied(true);
            toast({
                variant: "success",
                description: "Extracted image text inserted.",
            });
            setTimeout(() => onOpenChange(false), 1000);
        } catch (err) {
            console.error("Error saving extracted text: ", err);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not reflect the extracted text. Try again or copy to clipboard instead.",
            });
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[80svh] flex flex-col bg-slate-900 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Use extracted text?</DialogTitle>
                    <DialogDescription className="text-gray-300">
                        Extracted text from the image is shown below. <br />
                        Do you wish to save this text for study? <br />
                        * Note: By clicking &quot;Save&quot; below, this will replace any text you’ve entered previously. <br />
                        You can also copy the text to your clipboard. <br />
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 my-4 rounded-md border">
                    <pre className="p-4 whitespace-pre-wrap text-sm text-foreground font-body text-white">
                        {text || "No text was extracted from the image."}
                    </pre>
                </ScrollArea>
                <DialogFooter>
                    <CommonButton
                        onClick={handleCopy}
                        disabled={isCopied || !text}
                    >
                        {isCopied ? (
                            <Check className="mr-2" />
                        ) : (
                            <Copy className="mr-2" />
                        )}
                        {isCopied ? "Copied!" : "Copy"}
                    </CommonButton>
                    <CommonButton
                        onClick={handleSave}
                        disabled={isSaved || !text}
                    >
                        {isSaved ? (
                            <Check className="mr-2" />
                        ) : (
                            <Save className="mr-2" />
                        )}
                        {isSaved ? "Updated!" : "Save"}
                    </CommonButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
