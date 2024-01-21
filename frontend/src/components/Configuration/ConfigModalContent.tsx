import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { CenterGrid, TextField, IconButton, Divider, MenuItem, ButtonWidest } from '../Styled';
import { ConfigurationContext, handleSave } from './Configuration';
import { FormComponentConfig } from './Configuration';
import ConfigPreviewComponents from './ConfigPreviewComponents';


export default function ConfigModalContent() {
    const { itemName, formConfig, selected, categoryID, storedItems, handleClosePopup, setFormConfig, setSnackbarMessage, setOpenSnackbar } = useContext(ConfigurationContext);
    const [formOption, setFormOption] = useState<string>('');
    const [selectedFormOption, setSelectedFormOption] = useState<string>('');
    const [labelOption, setLabelOption] = useState<string>(selected.label || '');
    const optionElement = document.getElementById('select-option') as HTMLOptionElement;


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

    const handleCancel = () => {
        setFormConfig((prevFormConfig: FormComponentConfig[]) => {
            const newConfig = [...prevFormConfig];
            newConfig.pop();
            return newConfig;
        });
        handleClosePopup();
    };

    switch (formConfig[selected.order]?.type) {
        case 'single_select':
            return (
                <CenterGrid container>
                    <CenterGrid item xs={12}>
                        <Typography variant='h3' fontWeight='bold'>Preview</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <ConfigPreviewComponents configIndex={selected.order} />
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
                            {formConfig[selected.order]?.options.map((option) => (
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
                        <ButtonWidest variant='contained' onClick={async () => {
                            await handleSave(itemName, formConfig, categoryID, storedItems, setSnackbarMessage, setOpenSnackbar);
                            handleClosePopup();
                        }}>Ok</ButtonWidest>
                    </CenterGrid>

                    <CenterGrid item xs={6}>
                        <CenterGrid item xs={6}>
                            <ButtonWidest variant='contained' onClick={handleCancel}>Cancel</ButtonWidest>
                        </CenterGrid>
                    </CenterGrid>
                </CenterGrid>
            );
        case 'text':
            return (
                <Box>
                    <input type="text" placeholder={formConfig[selected.order]?.label} />
                </Box>
            );
        default:
            return <Box><span>This form object wasn't recognized. . .</span></Box>;

    }
}