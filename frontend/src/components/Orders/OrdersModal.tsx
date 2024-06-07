import { useContext } from "react";
import TransitionsModal from "../BaseComps/TransitionsModal";
import { UIContext } from "../BaseComps/contexts/UIContext";
import OrderModalContentBase from "./OrderModalContentBase";

export default function OrdersModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);

    return (
        <TransitionsModal children={<OrderModalContentBase
            pageName="active-orders"
            submitButtonText="save info"
            overrideSubmit={true}
            status="submitted"
            />
        }
            openPopup={openPopup} handleClosePopup={()=>setOpenPopup(false)} popup_sx={{ left: '50%' }} />
    )
}