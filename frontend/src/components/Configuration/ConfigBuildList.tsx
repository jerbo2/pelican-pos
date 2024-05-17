import React, { useContext, useState, useEffect } from "react";
import { FormConfigContext } from "./contexts/FormConfigContext";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { Box, Typography } from '@mui/material';
import { CenterGrid, Circle, IconButton, Divider, ButtonWidest, ButtonWider } from "../Styled";
import EditIcon from '@mui/icons-material/Edit';
import BasePreviewComponent from "../BaseComps/BasePreviewComponent";
import { FormValue } from "../BaseComps/dbTypes";
import axios from "axios";
import { ItemContext } from "./contexts/ItemContext";

export default function ConfigBuildList() {
    const { formConfig, setSelected } = useContext(FormConfigContext);
    const { storedItems, itemName } = useContext(ItemContext);
    const { setOpenPopup } = useContext(UIContext);
    const [formValues, setFormValues] = useState<FormValue[]>([]);
    const [price, setPrice] = useState<number>(0);

    const handleEdit = (id: string) => {
        const index = parseInt(id);
        setOpenPopup(true);
        setSelected({ ...formConfig[index], order: index });
    }

    useEffect(() => {
        // create initial form values from formConfig (label with empty val)
        if (formValues.length === 0 || formConfig.length !== formValues.length) {
            const initialFormValues = formConfig.map(config => ({
                label: config.label,
                value: ''
            }));
            setFormValues(initialFormValues);
        }
    }, [formConfig]);

    const checkPrice = async () => {
        const item = storedItems.find(item => item.name === itemName);
        const url = `/api/v1/items/${item?.id}/check_price/`
        const configurations = formValues.map((formValue, _) => {
            return { label: formValue.label, value: formValue.value }
        })
        const response = await axios.post(url, configurations)
        setPrice(response.data)
    }

    useEffect(() => {
        if (formValues.length > 0 && formValues.every(formValue => formValue.value !== '')) {
            console.log('checking price')
            checkPrice()
        }
    }, [formValues, formConfig])


    return (
        <Box>
            <CenterGrid container>
                {formConfig.length > 0 && (
                    <>
                        {formConfig.map((_, index) => {
                            return (
                                <React.Fragment key={index}>
                                    <CenterGrid item xs={12}>
                                        <Circle>{index + 1}</Circle>
                                        <BasePreviewComponent component={formConfig[index]} formValues={formValues} setFormValues={setFormValues} index={index} />
                                        <IconButton aria-label="edit" size="large" color="primary" onClick={(e) => handleEdit(e.currentTarget.id)} id={`${index}`}>
                                            <EditIcon fontSize='inherit' />
                                        </IconButton>
                                    </CenterGrid>
                                    <CenterGrid item key={`${index}_divider`} xs={12}><Divider /></CenterGrid>
                                </React.Fragment>
                            )
                        })}
                        <CenterGrid item xs={12}>
                            <Typography variant='h4'>Calculated price: ${price}</Typography>
                        </CenterGrid>
                    </>
                )}
            </CenterGrid>
        </Box>
    )
}