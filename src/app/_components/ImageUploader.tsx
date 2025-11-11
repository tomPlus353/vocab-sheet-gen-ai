"use client";

import { useState, useRef, type ChangeEvent } from "react";
import CommonButton from "@/components/common/CommonButton";
import { extractTextFromImage } from "@/ai/flows/extract-text-from-image";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import ImageTextModal from "./ImageTextModal";

interface Props {
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
                const result = await extractTextFromImage({ photoDataUri: base64data });
                if (result?.extractedText.trim()) {
                    setExtractedText(result.extractedText);
                    setIsModalOpen(true);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Extraction Failed",
                        description: "Could not extract any text from the image. Please try another image.",
                    });
                }
            } catch (error) {
                console.error("Error extracting text:", error);
                toast({
                    variant: "destructive",
                    title: "An Error Occurred",
                    description: "Something went wrong while processing the image. Please try again.",
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

        <div>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
            />
            <CommonButton
                onClick={() => fileInputRef.current?.click()
                }
                disabled={isLoading}
            >
                {
                    isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Camera className="h-5 w-5" />
                    )
                }
                {isLoading ? "Extracting Text..." : "Upload Image"}
            </CommonButton >
            <ImageTextModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                text={extractedText}
                setTextboxFunction={setTextboxFunction}
            />
        </div >

    );
}
