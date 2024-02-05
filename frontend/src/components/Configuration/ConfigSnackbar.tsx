import { useContext } from "react";
import SimpleSnackbar from "../BaseComps/SimpleSnackbar";

import { UIContext } from "./contexts/UIContext";

export default function ConfigSnackbar() {
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