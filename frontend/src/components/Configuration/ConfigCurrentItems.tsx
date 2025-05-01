import { useContext, useEffect } from "react";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { ItemContext } from "./contexts/ItemContext";
import { FormConfigContext } from "./contexts/FormConfigContext";
import { WebSocketContext } from "../BaseComps/contexts/WebSocketContext";
import BaseCurrentItems from "../BaseComps/BaseCurrentItems";

export default function ConfigCurrentItems() {
    const { storedItems, setStoredItems, setItemName, setTaxRate, setInventory } = useContext(ItemContext);
    const { openDrawer, handleOpenDrawer } = useContext(UIContext);
    const { setFormConfig } = useContext(FormConfigContext);
    const { lastMessage } = useContext(WebSocketContext);

    useEffect(() => {
        const messageData = JSON.parse(lastMessage || '{}');
        if (messageData.type === 'items-update') {
            setStoredItems(messageData.payload);
        }
    }, [lastMessage]);

    const handleTapCard = (str_id: string) => {
        console.log('tapped card', str_id);
        const id = parseInt(str_id);
        handleOpenDrawer(false);
        console.log(storedItems[id])
        setItemName(storedItems[id].name);
        setTaxRate(storedItems[id].tax_rate);
        setFormConfig(storedItems[id].form_cfg);
        setInventory(storedItems[id].inventory_config);
    }

    return (
        <BaseCurrentItems showTrigger={openDrawer} items={storedItems} handleTapCard={handleTapCard} />
    )
}