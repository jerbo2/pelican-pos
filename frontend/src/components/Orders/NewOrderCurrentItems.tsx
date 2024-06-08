import { useContext } from "react"
import BaseCurrentItems from "../BaseComps/BaseCurrentItems"
import { ItemContext } from "../Configuration/contexts/ItemContext"
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext"

export default function NewOrderCurrentItems({ showCards, setShowCards }: { showCards: boolean, setShowCards: (arg0: boolean) => void }) {
    const { storedItems, setItemName } = useContext(ItemContext)
    const { setFormConfig } = useContext(FormConfigContext)

    const handleTapCard = (str_id: string) => {
        const id = parseInt(str_id);
        console.log(id)
        if (storedItems[id].form_cfg.every(config => config.type !== 'price')) {
            setShowCards(false);
        }
        setItemName(storedItems[id].name);
        setFormConfig(storedItems[id].form_cfg);
    }

    return (
        <BaseCurrentItems showTrigger={!showCards} items={storedItems} handleTapCard={handleTapCard} />
    )
}