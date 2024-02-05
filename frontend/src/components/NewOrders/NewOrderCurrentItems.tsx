import { useContext, useState } from "react"
import BaseCurrentItems from "../BaseComps/BaseCurrentItems"
import { ItemContext } from "../Configuration/contexts/ItemContext"
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext"

export default function NewOrderCurrentItems({notShowCards, setNotShowCards}: {notShowCards: boolean, setNotShowCards: (arg0: boolean) => void}){
    const { storedItems, setItemName } = useContext(ItemContext)
    const { setFormConfig, formConfig } = useContext(FormConfigContext)

    console.log(storedItems)

    const handleTapCard = (str_id: string) => {
        const id = parseInt(str_id);
        console.log(id)
        setNotShowCards(true);
        setItemName(storedItems[id].name);
        setFormConfig(storedItems[id].form_cfg);
    }

    console.log(formConfig)

    return (
        <BaseCurrentItems showTrigger={notShowCards} items={storedItems} handleTapCard={handleTapCard} />
    )
}