"use client";

import CommonButton from "@/components/common/CommonButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Props = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function ConfirmActionModal(props: Props) {
    const { open, title, description, confirmLabel, onOpenChange, onConfirm } =
        props;

    function handleConfirm() {
        onConfirm();
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 text-white">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="text-slate-300">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <CommonButton
                        label="Cancel"
                        additionalclasses="mx-0 bg-slate-700 hover:bg-slate-600"
                        onClick={() => onOpenChange(false)}
                    />
                    <CommonButton
                        label={confirmLabel}
                        additionalclasses="mx-0 bg-red-700 hover:bg-red-600"
                        onClick={handleConfirm}
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
