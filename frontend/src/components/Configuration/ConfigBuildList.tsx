import React, { useContext, useState, useEffect } from "react";
import { FormConfigContext } from "./contexts/FormConfigContext";
import { UIContext } from "../BaseComps/contexts/UIContext";
import { Box, Typography } from '@mui/material';
import { CenterGrid, Circle, IconButton, Divider } from "../Styled";
import EditIcon from '@mui/icons-material/Edit';
import BasePreviewComponent from "../BaseComps/BasePreviewComponent";
import { FormComponentConfig, FormValue } from "../BaseComps/dbTypes";
import axios from "axios";
import { ItemContext } from "./contexts/ItemContext";
import _ from 'lodash';

async function updateItemWithFormConfig(itemId: number, formCfg: FormComponentConfig[], formValues: FormValue[]) {

    console.log(formValues)

    const updatedFormCfg = formCfg.map((config) => {
        if (config.pricing_config.priceBy === 'Input') {
            const formValue = formValues.find(formValue => formValue.label === config.label);
            if (formValue) {
                return {
                    ...config,
                    pricing_config: {
                        ...config.pricing_config,
                        constantValue: formValue.value
                    }
                };
            }
        }
        return config;
    });

    console.log(formCfg, updatedFormCfg)

    // Check if the form_cfg was actually updated
    if (!_.isEqual(formCfg, updatedFormCfg)) {
        console.log('updating form config to reflect input price')
        const updateItemUrl = `/admin/items/update/${itemId}`;
        try {
            const res = await axios.patch(updateItemUrl, { form_cfg: updatedFormCfg });
            console.log(res.data);
        } catch (error) {
            console.error('Failed to update item:', error);
        }
    }
    console.log('form config is up to date')
}

function ConfigBuildList() {
    const { formConfig, setSelected } = useContext(FormConfigContext);
    const { storedItems, itemName, taxRate } = useContext(ItemContext);
    const { setOpenPopup, openDrawer } = useContext(UIContext);
    const [formValues, setFormValues] = useState<FormValue[]>([]);
    const [price, setPrice] = useState<number>(0);

    const handleEdit = (id: string) => {
        const index = parseInt(id);
        setOpenPopup(true);
        setSelected({ ...formConfig[index], order: index });
    }

    useEffect(() => {
        // create initial form values from formConfig (label with empty val)
        const initialFormValues = formConfig.map(config => ({
            label: config.label,
            value: formValues.find(formValue => formValue.label === config.label)?.value || ''
        }));
        setFormValues(initialFormValues);
    }, [formConfig]);

    const checkPrice = async () => {
        const item = storedItems.find(item => item.name === itemName);
        const url = `/items/${item?.id}/check_price/`
        const configurations = formValues.map((formValue, _) => {
            return { label: formValue.label, value: formValue.value }
        })

        if (item) await updateItemWithFormConfig(item.id, formConfig, formValues)

        console.log(configurations)
        const response = await axios.post(url, configurations)
        setPrice(response.data)
    }

    useEffect(() => {
        console.log(formValues)
        const filledOut = formValues.filter(formValue => formValue.label !== '').every(formValue => formValue.value !== '')
        if (formValues.length > 0 && filledOut && openDrawer && formConfig.some(config => config.pricing_config.affectsPrice === true)) {
            console.log('checking price')
            checkPrice()
        }
    }, [formValues, formConfig, taxRate])


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

export default ConfigBuildList;
export { updateItemWithFormConfig }