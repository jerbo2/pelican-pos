import React, { useContext } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { ItemContext } from "../Configuration/contexts/ItemContext";
import { CenterGrid, Circle, Divider, ButtonWidest } from "../Styled";
import BasePreviewComponents from "../BaseComps/BasePreviewComponents";
import BaseToolBar from "../BaseComps/BaseToolBar";

export default function NewOrderForm({ notShowCards, setNotShowCards }: { notShowCards: boolean, setNotShowCards: (arg0: boolean) => void }) {
    const { formConfig } = useContext(FormConfigContext);
    const { itemName } = useContext(ItemContext)
    const pageName = notShowCards ? `CREATING NEW ${itemName.toLocaleUpperCase()} ORDER` : 'SELECT AN ITEM'

    return (

        <CenterGrid container>
            <CenterGrid item xs={12}>
                <BaseToolBar pageName={pageName} />
            </CenterGrid>
            {notShowCards && (
                <>
                    {formConfig.map((config, index) => {
                        return (
                            <React.Fragment key={index}>

                                <CenterGrid item xs={12}>
                                    {/* <Circle>{index + 1}</Circle> */}
                                    <BasePreviewComponents component={formConfig[index]} />
                                </CenterGrid>
                                <CenterGrid item key={`${index}_divider`} xs={12}>
                                    <Divider />
                                </CenterGrid>

                            </React.Fragment>
                        )
                    })}
                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={() => setNotShowCards(false)}>CANCEL</ButtonWidest>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={() => console.log('submitted but not really')}>SUBMIT</ButtonWidest>
                    </CenterGrid>
                </>
            )}
        </CenterGrid>
    )
}