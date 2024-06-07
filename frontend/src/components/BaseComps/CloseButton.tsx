import { Box } from "@mui/material";
import { IconButton } from "../Styled";
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationButton from "./ConfirmationButton";

interface CloseButtonProps {
    override?: boolean;
    handleOnConfirmed: () => void;
    handleOnUnConfirmed?: () => void;
    dialogContent?: string;
    shiftAmount?: number;
}

const CloseButton = ({ override, handleOnConfirmed, handleOnUnConfirmed, dialogContent, shiftAmount = 0 }: CloseButtonProps) => {
    return (
        <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
            <ConfirmationButton
                aria-label='close'
                buttonType={IconButton}
                onConfirmed={handleOnConfirmed}
                onUnconfirmed={handleOnUnConfirmed}
                override={override}
                shiftAmount={shiftAmount}
                dialogContent={dialogContent}>
                <CloseIcon fontSize='large' />
            </ConfirmationButton>
        </Box>
    );
}

export default CloseButton;
