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
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageTextModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    text: string;
    setTextboxFunction?: (text: string) => void;
}

export default function ImageTextModal({ open, onOpenChange, text, setTextboxFunction }: ImageTextModalProps) {
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!open) {
            // Reset copied state when modal closes
            setTimeout(() => setIsCopied(false), 200);
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
            if (setTextboxFunction) setTextboxFunction(text)
            setIsCopied(true);
            toast({
                description: "Extracted text copied to clipboard.",
            });
            setTimeout(() => setIsCopied(false), 3000);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Copy Failed",
                description: "Could not copy text to clipboard.",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-[80svh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-headline">Extracted Text</DialogTitle>
                    <DialogDescription>
                        The text from your image is ready. You can copy it below.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 my-4 rounded-md border">
                    <pre className="p-4 whitespace-pre-wrap text-sm text-foreground font-body">
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
                        {isCopied ? "Copied!" : "Copy Text"}
                    </CommonButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
