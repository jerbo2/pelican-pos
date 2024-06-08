import { useContext } from "react";
import TransitionsModal from "../BaseComps/TransitionsModal";
import { UIContext } from "../BaseComps/contexts/UIContext";
import OrderModalContentBase from "./OrderModalContentBase";

export default function OrdersModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);

    return (
        <TransitionsModal children={<OrderModalContentBase
            submitButtonText="save"
            overrideSubmit={true}
            />
        }
            openPopup={openPopup} handleClosePopup={()=>setOpenPopup(false)} popup_sx={{ left: '50%' }} />
    )
}