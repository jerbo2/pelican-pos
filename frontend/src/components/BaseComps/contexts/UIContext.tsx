import { Dispatch, createContext, useState, SetStateAction } from 'react';

const UIContext = createContext<{
    openPopup: boolean;
    openDrawer: boolean;
    openDialog: boolean;
    openSnackbar: boolean;
    snackbarMessage: string;
    setOpenSnackbar: Dispatch<SetStateAction<boolean>>;
    setSnackbarMessage: Dispatch<SetStateAction<string>>;
    setOpenPopup: Dispatch<SetStateAction<boolean>>;
    setOpenDrawer: Dispatch<SetStateAction<boolean>>;
    setOpenDialog: Dispatch<SetStateAction<boolean>>;
    handleOpenDrawer: (create: boolean) => void;
}>({
    openPopup: false,
    openDrawer: false,
    openDialog: false,
    openSnackbar: false,
    snackbarMessage: '',
    setOpenSnackbar: () => { },
    setSnackbarMessage: () => { },
    setOpenPopup: () => { },
    setOpenDrawer: () => { },
    setOpenDialog: () => { },
    handleOpenDrawer: () => { },
});

const UIProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [openPopup, setOpenPopup] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleOpenDrawer = (create: boolean) => {
        if (create) {
            setOpenDialog(true);
        }
        else {
            setOpenDrawer(true);
        }
    };

    return (
        <UIContext.Provider value={{ openPopup, openDrawer, openDialog, openSnackbar, snackbarMessage, setOpenSnackbar, setSnackbarMessage, setOpenPopup, setOpenDrawer, setOpenDialog, handleOpenDrawer }}>
            {children}
        </UIContext.Provider>
    );
};

export { UIContext, UIProvider };
