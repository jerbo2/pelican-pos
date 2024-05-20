import { Dispatch, createContext, useState, SetStateAction } from 'react';

const UIContext = createContext<{
    openPopup: boolean;
    openDrawer: boolean;
    openDialog: boolean;
    openSnackbar: boolean;
    snackbarMessage: string;
    dialogType: string;
    setOpenSnackbar: Dispatch<SetStateAction<boolean>>;
    setSnackbarMessage: Dispatch<SetStateAction<string>>;
    setOpenPopup: Dispatch<SetStateAction<boolean>>;
    setOpenDrawer: Dispatch<SetStateAction<boolean>>;
    setOpenDialog: Dispatch<SetStateAction<boolean>>;
    handleOpenDrawer: (create: boolean) => void;
    setDialogType: Dispatch<SetStateAction<string>>;
}>({
    openPopup: false,
    openDrawer: false,
    openDialog: false,
    openSnackbar: false,
    snackbarMessage: '',
    dialogType: '',
    setOpenSnackbar: () => { },
    setSnackbarMessage: () => { },
    setOpenPopup: () => { },
    setOpenDrawer: () => { },
    setOpenDialog: () => { },
    handleOpenDrawer: () => { },
    setDialogType: () => { },
});

const UIProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [openPopup, setOpenPopup] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [dialogType, setDialogType] = useState('');

    const handleOpenDrawer = (create: boolean) => {
        if (create) {
            setDialogType('name');
            setOpenDialog(true);
        }
        else {
            setOpenDrawer(true);
        }
    };

    return (
        <UIContext.Provider value={{ openPopup, openDrawer, openDialog, openSnackbar, snackbarMessage, dialogType, setOpenSnackbar, setSnackbarMessage, setOpenPopup, setOpenDrawer, setOpenDialog, handleOpenDrawer, setDialogType }}>
            {children}
        </UIContext.Provider>
    );
};

export { UIContext, UIProvider };
