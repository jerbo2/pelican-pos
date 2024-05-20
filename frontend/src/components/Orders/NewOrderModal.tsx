import { useContext } from "react";
import TransitionsModal from "../BaseComps/TransitionsModal";
import { UIContext } from "../BaseComps/contexts/UIContext";
import OrderModalContent from "./OrderModalContent";

export default function NewOrderModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);

    return (
        <TransitionsModal children={<OrderModalContent
            pageName="order"
            submitButtonText="confirm"/>
        }
            openPopup={openPopup} handleClosePopup={()=>setOpenPopup(false)} popup_sx={{ left: '50%' }} />
    )
}