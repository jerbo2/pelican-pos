import { useContext } from "react";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { ItemContext } from "./contexts/ItemContext";
import { FormConfigContext } from "./contexts/FormConfigContext";
import BaseCurrentItems from "../BaseComps/BaseCurrentItems";

export default function ConfigCurrentItems() {
    const { storedItems, setItemName } = useContext(ItemContext);
    const { openDrawer, handleOpenDrawer } = useContext(UIContext);
    const { setFormConfig } = useContext(FormConfigContext);

    const handleTapCard = (str_id: string) => {
        const id = parseInt(str_id);
        console.log(id)
        handleOpenDrawer(false);
        setItemName(storedItems[id].name);
        setFormConfig(storedItems[id].form_cfg);
    }

    return (
        <BaseCurrentItems showTrigger={openDrawer} items={storedItems} handleTapCard={handleTapCard} />
    )
}