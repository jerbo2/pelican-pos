import { useContext } from "react";
import TransitionsModal from "../BaseComps/TransitionsModal";
import ConfigModalContent from "./ConfigModalContent";
import { UIContext } from "../BaseComps/contexts/UIContext";

export default function ConfigModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);

    const handleClosePopup = () => {
        setOpenPopup(false);
    };

    return (
        <TransitionsModal children={<ConfigModalContent handleClosePopup={handleClosePopup} />} openPopup={openPopup} handleClosePopup={handleClosePopup}/>
    )
}