"use client";

import { useState, useRef, type ChangeEvent } from "react";
import CommonButton from "@/components/common/CommonButton";
import { extractTextFromImage } from "@/ai/flows/extractTextFromImage";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import ImageTextModal from "./ImageTextModal";
import { Toaster } from "@/components/ui/toaster";

interface Props {
    className?: string;
    setTextboxFunction?: (text: string) => void;
}
export default function ImageUploader(props: Props) {
    const { setTextboxFunction } = props;
    const [extractedText, setExtractedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64data = reader.result as string;
            try {
                // Call the AI service on the server to extract text
                const result = await extractTextFromImage({
                    photoDataUri: base64data,
                });

                //mock result for testing without calling the AI service
                // const result = { extractedText: "Mock extracted text from image", error: false };

                if (result?.extractedText.trim() && !result.error) {
                    setExtractedText(result.extractedText);
                    setIsModalOpen(true);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Extraction Failed",
                        description:
                            "Could not extract any text from the image. Please try another image.",
                    });
                }
            } catch (error) {
                console.error("Error extracting text:", error);
                toast({
                    variant: "destructive",
                    title: "An Error Occurred",
                    description:
                        "Something went wrong while processing the image. Please try again.",
                });
            } finally {
                setIsLoading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.onerror = () => {
            toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the selected file.",
            });
            setIsLoading(false);
        };
    };

    return (
        <div className={props.className}>
            <input
                type="file"
                accept="image/*,android/allowCamera"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
            />
            <CommonButton
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                additionalclasses="w-full"
            >
                <div className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Camera className="h-5 w-5" />
                    )}
                    {isLoading ? "Extracting Text..." : "Upload Image"}
                </div>
            </CommonButton>
            <ImageTextModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                text={extractedText}
                setTextboxFunction={setTextboxFunction}
            />
            <Toaster />
        </div>
    );
}
