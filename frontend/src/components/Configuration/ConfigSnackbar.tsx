import { useContext } from "react";
import SimpleSnackbar from "../custom_MUI/SimpleSnackbar";

import { ConfigurationContext } from "./Configuration";

export default function ConfigSnackbar() {
    const { openSnackbar, snackbarMessage, setOpenSnackbar } = useContext(
        ConfigurationContext
    );

    return (
        <SimpleSnackbar
            openSnackbar={openSnackbar}
            message={snackbarMessage}
            setOpenSnackbar={setOpenSnackbar}
        />
    );
}