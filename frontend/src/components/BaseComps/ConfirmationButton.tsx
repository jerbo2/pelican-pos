import { ReactNode, useState } from 'react';
import { ButtonWidest } from '../Styled';
import FormDialog from './FormDialog';

interface ConfirmationButtonProps {
    onDeleteConfirmed: () => void;
    dialogContent?: string;
    shiftAmount?: number;
    children: ReactNode;
}

function ConfirmationButton({ onDeleteConfirmed, dialogContent, shiftAmount, children }: ConfirmationButtonProps) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = () => {
        onDeleteConfirmed();
        setOpen(false);
    };

    return (
        <>
            <ButtonWidest variant="contained" onClick={handleClickOpen}>
                {children}
            </ButtonWidest>
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
                        <ButtonWidest onClick={handleDelete}>Yes</ButtonWidest>
                    </>
                }
            />

        </>
    );
}

export default ConfirmationButton;
