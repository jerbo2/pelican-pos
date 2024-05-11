import { useContext } from "react";
import SimpleSnackbar from "./SimpleSnackbar";

import { UIContext } from "./contexts/UIContext";

export default function Snackbar() {
    const { openSnackbar, snackbarMessage, setOpenSnackbar } = useContext(
        UIContext
    );

    return (
        <SimpleSnackbar
            openSnackbar={openSnackbar}
            message={snackbarMessage}
            setOpenSnackbar={setOpenSnackbar}
        />
    );
}