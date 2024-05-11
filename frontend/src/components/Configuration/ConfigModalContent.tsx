import { useContext, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { CenterGrid, TextField, IconButton, Divider, MenuItem, ButtonWidest } from '../Styled';
import { FormConfigContext } from './contexts/FormConfigContext';
import { ItemContext } from './contexts/ItemContext';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { FormComponentConfig } from '../BaseComps/dbTypes';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';
import BasePreviewComponents from '../BaseComps/BasePreviewComponents';
import ConfirmationButton from '../BaseComps/ConfirmationButton';
import axios from 'axios';

const formCompDelConfirm = 'Are you sure you want to delete this form option?'

export default function ConfigModalContent({ handleClosePopup }: { handleClosePopup: () => void }) {
    const { itemName, storedItems, categoryID, setStoredItems } = useContext(ItemContext);
    const { formConfig, setFormConfig, selected } = useContext(FormConfigContext);
    const { setSnackbarMessage, setOpenSnackbar } = useContext(UIContext);
    const { sendMessage } = useContext(WebSocketContext);

    const [formOption, setFormOption] = useState<string>('');
    const [selectedFormOption, setSelectedFormOption] = useState<string>('');
    const [labelOption, setLabelOption] = useState<string>(selected.label || '');
    const optionElement = document.getElementById('select-option') as HTMLOptionElement;

    const formOptionNew = storedItems.find((item) => item.name === itemName)?.form_cfg.length !== formConfig.length;

    function generateHash(data: FormComponentConfig[]) {
        return data.reduce((acc, item) => acc + JSON.stringify(item), '');
    }

    async function handleSave(newFormConfig: FormComponentConfig[]) {
        const item = storedItems.filter(item => item.name === itemName)[0];
        const itemExists = item !== undefined;

        if (itemExists) {
            const storedConfigHash = generateHash(item.form_cfg);
            const currentConfigHash = generateHash(newFormConfig);
            if (storedConfigHash === currentConfigHash) {
                console.log('No changes detected');
                handleClosePopup();
                return;
            }

        }

        const url = itemExists ? `/api/v1/items/update/${item.id}/` : '/api/v1/items/create/';
        const axiosMethod = itemExists ? axios.put : axios.post;

        const payload = {
            "name": itemName,
            "form_cfg": newFormConfig,
            "category_id": categoryID,
        };

        try {
            const res = await axiosMethod(url, payload);
            setSnackbarMessage(`${itemName} ${itemExists ? 'Updated' : 'Saved'}!`);
            setOpenSnackbar(true);
            const newStoredItems = itemExists ? storedItems.map(item => item.name === itemName ? res.data : item) : [...storedItems, res.data];
            setStoredItems(newStoredItems);
            setFormConfig(res.data.form_cfg);

            sendMessage(JSON.stringify({ type: 'items-update', payload: newStoredItems }));
            sendMessage(JSON.stringify({ type: 'config-update', payload: res.data.form_cfg }));
            handleClosePopup();
        } catch (err) {
            console.log(err);
            setSnackbarMessage(`Error ${itemExists ? 'Updating' : 'Saving'} Item`);
            setOpenSnackbar(true);
        }
    }


    const handleEditOption = (mode: string) => {
        if (formOption.trim() !== '' || selectedFormOption !== '') {
            // will need to check for all form components that have options
            setFormConfig((prevFormConfig: FormComponentConfig[]) => {
                const newConfig = [...prevFormConfig];

                const updatedFormObject = {
                    ...newConfig[selected.order],
                    options: mode === 'add' ? [...newConfig[selected.order].options, formOption.trim()] : newConfig[selected.order].options.filter((option) => option !== selectedFormOption)
                };

                newConfig[selected.order] = updatedFormObject;

                return newConfig;

            })
            setFormOption('');
            setSelectedFormOption('');
            //setPreviewSelected([]);
            optionElement.value = '';
        }

    };

    useEffect(() => {
        setFormConfig((prevFormConfig: FormComponentConfig[]) => {
            const newConfig = [...prevFormConfig];
            const updatedFormObject = { ...newConfig[selected.order], label: labelOption || '' };

            newConfig[selected.order] = updatedFormObject;

            return newConfig;
        });

    }, [labelOption]);


    useEffect(() => {
        if (selected.type === 'datetime' && formOptionNew) {
            handleSave(formConfig);
            handleClosePopup();
        }
    }, [selected.type]);


    const handleCancel = () => {
        // mismatch in lengths mean the form option is new / not yet saved. cancelling should remove it
        if (formOptionNew) {
            setFormConfig((prevFormConfig: FormComponentConfig[]) => {
                const newConfig = [...prevFormConfig];
                newConfig.pop();
                return newConfig;
            });
        }
        handleClosePopup();
    };

    const handleFormComponentDelete = () => {
        const newFormConfig = [...formConfig];
        newFormConfig.splice(selected.order, 1);

        handleClosePopup();

        handleSave(newFormConfig);
    };


    switch (formConfig[selected.order]?.type) {
        case 'single_select':
            return (
                <CenterGrid container>
                    <CenterGrid item xs={12}>
                        <Typography variant='h3' fontWeight='bold'>Preview</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <BasePreviewComponents component={formConfig[selected.order]} />
                    </CenterGrid>

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    <CenterGrid item xs={12}>
                        <Typography variant='h3' fontWeight='bold'>Configuration</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={6}>
                        <TextField
                            fullWidth
                            label='Label'
                            variant='filled'
                            value={labelOption}
                            onChange={(e) => setLabelOption(e.target.value)}
                        />
                    </CenterGrid>

                    <CenterGrid item xs={6} style={{ position: 'relative' }}>
                        <TextField
                            fullWidth
                            id='select-option'
                            label='Option'
                            onChange={(e) => setFormOption(e.target.value)}
                            variant="filled"
                        />
                        <IconButton
                            aria-label='add'
                            size='large'
                            style={{ position: 'absolute', top: 0, right: 0 }}
                            onClick={() => handleEditOption('add')}
                        >
                            <AddOutlinedIcon fontSize='inherit' />
                        </IconButton>
                    </CenterGrid>

                    <CenterGrid item xs={12} style={{ position: 'relative' }}>
                        <TextField
                            select
                            fullWidth
                            label='Options'
                            variant='filled'
                            value={selectedFormOption}
                            onChange={(e) => setSelectedFormOption(e.target.value)}
                        >
                            {formConfig[selected.order]?.options.map((option: any) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                        <IconButton
                            aria-label='delete'
                            size='large'
                            style={{ position: 'absolute', top: 0, right: '2rem' }}
                            onClick={() => handleEditOption('delete')}
                        >
                            <RemoveCircleOutlineIcon fontSize='inherit' />
                        </IconButton>
                    </CenterGrid>

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={() => { handleSave(formConfig) }}>Ok</ButtonWidest>
                    </CenterGrid>

                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={handleCancel}>Cancel</ButtonWidest>
                    </CenterGrid>

                    {!formOptionNew && (
                        <CenterGrid item xs={12}>
                            <ConfirmationButton onConfirmed={handleFormComponentDelete} dialogContent={formCompDelConfirm}>Delete</ConfirmationButton>
                        </CenterGrid>
                    )}

                </CenterGrid>
            );
        case 'text':
            return (
                <CenterGrid container>
                    <CenterGrid item xs={12}>
                        <Typography variant='h3' fontWeight='bold'>Preview</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <BasePreviewComponents component={formConfig[selected.order]} />
                    </CenterGrid>

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    <CenterGrid item xs={12}>
                        <Typography variant='h3' fontWeight='bold'>Configuration</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <TextField
                            fullWidth
                            label='Label'
                            variant='filled'
                            value={labelOption}
                            onChange={(e) => setLabelOption(e.target.value)}
                        />
                    </CenterGrid>

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={() => { handleSave(formConfig) }}>Ok</ButtonWidest>
                    </CenterGrid>

                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={handleCancel}>Cancel</ButtonWidest>
                    </CenterGrid>

                    {!formOptionNew && (
                        <CenterGrid item xs={12}>
                            <ConfirmationButton onConfirmed={handleFormComponentDelete} dialogContent={formCompDelConfirm}>Delete</ConfirmationButton>
                        </CenterGrid>
                    )}

                </CenterGrid>
            );
        case 'datetime':
            return (
                // datetime can't really be configured so just save and exit, only render when it's already established
                !formOptionNew && (
                    <CenterGrid container>
                        <CenterGrid item xs={12}>
                            <ButtonWidest variant='contained' onClick={handleCancel}>Ok</ButtonWidest>
                        </CenterGrid>
                        <CenterGrid item xs={12}>
                            <ConfirmationButton onConfirmed={handleFormComponentDelete} dialogContent={formCompDelConfirm}>Delete</ConfirmationButton>
                        </CenterGrid>
                    </CenterGrid>
                )
            );
        default:
            return <Box><span></span></Box>;

    }
}