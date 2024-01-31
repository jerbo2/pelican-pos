import { useContext, useState } from "react"
import BaseCurrentItems from "../custom_comps/BaseCurrentItems"
import { ItemContext } from "../Configuration/contexts/ItemContext"
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext"

export default function NewOrderCurrentItems() {
    const { storedItems, setItemName } = useContext(ItemContext)
    const { setFormConfig, formConfig } = useContext(FormConfigContext)
    const [ notShowCards, setNotShowCards ] = useState(false)

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