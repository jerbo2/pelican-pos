import { useContext } from "react";
import TransitionsModal from "../custom_comps/TransitionsModal";
import ConfigModalContent from "./ConfigModalContent";
import { UIContext } from "./contexts/UIContext";
import { ItemContext } from "./contexts/ItemContext";

export default function ConfigModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);
    const { getStoredItems } = useContext(ItemContext);

    const handleClosePopup = () => {
        getStoredItems();
        setOpenPopup(false);
    };

    return (
        <TransitionsModal children={<ConfigModalContent handleClosePopup={handleClosePopup} />} openPopup={openPopup} handleClosePopup={handleClosePopup}/>
    )
}