
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HealthForm } from './health-form';
import type { HealthFormData } from '@/types/health-form';

interface HealthFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialData: HealthFormData | null;
    onSuccess: () => void;
}

export function HealthFormModal({ isOpen, onClose, userId, initialData, onSuccess }: HealthFormModalProps) {

    const handleFormSubmit = () => {
        onSuccess();
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Cuestionario de Salud</DialogTitle>
                    <DialogDescription>
                        Tus respuestas nos ayudarán a crear un plan completamente personalizado para ti. Por favor, sé lo más precisa posible.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] p-1 pr-6">
                   <HealthForm userId={userId} initialData={initialData} onFormSubmit={handleFormSubmit} />
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
