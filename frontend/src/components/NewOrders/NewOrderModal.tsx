import { useContext } from "react";
import TransitionsModal from "../BaseComps/TransitionsModal";
import { UIContext } from "../BaseComps/contexts/UIContext";
import NewOrderModalContent from "./NewOrderModalContent";

export default function NewOrderModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);

    const handleClosePopup = () => {
        setOpenPopup(false);
    };

    return (
        <TransitionsModal children={<NewOrderModalContent handleClosePopup={handleClosePopup} />} openPopup={openPopup} handleClosePopup={handleClosePopup} popup_sx={{left: '50%'}}/>
    )
}