import { ReactNode, useState, useEffect, ComponentType } from 'react';
import { ButtonWidest } from '../Styled';
import FormDialog from './FormDialog';

interface ConfirmationButtonProps {
    onConfirmed: () => void;
    dialogContent?: string;
    shiftAmount?: number;
    override?: boolean;
    children: ReactNode;
    buttonType?: ComponentType<any>; // Accept any button component
}

function ConfirmationButton({ onConfirmed, dialogContent, shiftAmount, override, children, buttonType: ButtonType = ButtonWidest }: ConfirmationButtonProps) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        if (!override) {
            setOpen(true);
        }
        else {
            onConfirmed();
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        onConfirmed();
        setOpen(false);
    };

    return (
        <>
            <ButtonType variant='contained' onClick={handleClickOpen}>
                {children}
            </ButtonType>
            <FormDialog
                openDialog={open}
                handleCloseDialog={handleClose}
                shiftAmount={shiftAmount}
                setItemName={() => { }}
                dialogTitle='Confirmation'
                dialogContent={dialogContent || 'Are you sure you want to delete this item?'}
                dialogActions={
                    <>
                        <ButtonWidest onClick={handleClose}>No</ButtonWidest>
                        <ButtonWidest onClick={handleConfirm}>Yes</ButtonWidest>
                    </>
                }
            />

        </>
    );
}

export default ConfirmationButton;
