import { useContext } from "react";
import TransitionsModal from "../BaseComps/TransitionsModal";
import { UIContext } from "../BaseComps/contexts/UIContext";
import OrderModalContent from "./OrderModalContent";

export default function OrdersModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);

    return (
        <TransitionsModal children={<OrderModalContent
            pageName="active-orders"
            submitButtonText="save info"
            overrideSubmit={true}
            />
        }
            openPopup={openPopup} handleClosePopup={()=>setOpenPopup(false)} popup_sx={{ left: '50%' }} />
    )
}