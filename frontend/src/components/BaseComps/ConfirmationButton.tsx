import { ReactNode, useState, ComponentType } from 'react';
import { ButtonWidest } from '../Styled';
import FormDialog from './FormDialog';

interface ConfirmationButtonProps {
    onConfirmed: () => void;
    dialogContent?: string | ReactNode;
    shiftAmount?: number;
    override?: boolean;
    children: ReactNode;
    buttonType?: ComponentType<any>; // Accept any button component
    disabled?: boolean;
    color?: 'primary' | 'secondary';
    type?: 'button' | 'submit' | 'reset';
    variant?: string;
    onUnconfirmed?: () => void;
}

function ConfirmationButton({ onConfirmed, dialogContent, shiftAmount = 0, override, children, buttonType: ButtonType = ButtonWidest, disabled, color, type, onUnconfirmed, variant = 'contained' }: ConfirmationButtonProps) {
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
        if (onUnconfirmed) {
            onUnconfirmed();
        }
        setOpen(false);
    };

    const handleConfirm = () => {
        onConfirmed();
        setOpen(false);
    };

    return (
        <>
            <ButtonType variant={variant} onClick={handleClickOpen} disabled={disabled} color={color} type={type}>
                {children}
            </ButtonType>
            <FormDialog
                openDialog={open}
                handleCloseDialog={handleClose}
                shiftAmount={shiftAmount}
                handleSubmit={() => {}}
                dialogTitle='Confirmation'
                dialogContent={dialogContent}
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
