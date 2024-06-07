import { useContext } from "react";
import TransitionsModal from "../BaseComps/TransitionsModal";
import { UIContext } from "../BaseComps/contexts/UIContext";
import OrderModalContentBase from "./OrderModalContentBase";

export default function NewOrderModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);

    return (
        <TransitionsModal children={<OrderModalContentBase
            overrideSubmit={false}
            pageName="order"
            submitButtonText="confirm"
            status="pending"/>
        }
            openPopup={openPopup} handleClosePopup={()=>setOpenPopup(false)} popup_sx={{ left: '50%' }} />
    )
}