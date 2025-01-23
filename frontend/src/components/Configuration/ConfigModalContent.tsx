import { useContext, useEffect, useState } from 'react';
import { ButtonGroup, Typography, Button, Fade } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditIcon from '@mui/icons-material/Edit';
import { CenterGrid, TextField, IconButton, Divider, MenuItem, ButtonWidest } from '../Styled';
import { FormConfigContext } from './contexts/FormConfigContext';
import { ItemContext } from './contexts/ItemContext';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { FormComponentConfig } from '../BaseComps/dbTypes';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';
import BasePreviewComponents from '../BaseComps/BasePreviewComponent';
import ConfirmationButton from '../BaseComps/ConfirmationButton';
import ConfigPricingSequence from './ConfigPricingSequence';
import axios from 'axios';
import { DRAWER_WIDTH } from '../Constants';
import _, { set } from 'lodash';
import CloseButton from '../BaseComps/CloseButton';

const formCompDelConfirm = 'Are you sure you want to delete this form option?'
const closeWithoutSaving = 'Close without saving?'

export default function ConfigModalContent({ handleClosePopup }: { handleClosePopup: () => void }) {
    const { itemName, storedItems, categoryID, taxRate, inventory, setStoredItems, setInventory } = useContext(ItemContext);
    const { formConfig, setFormConfig, selected, setSelected } = useContext(FormConfigContext);
    const { setSnackbarMessage, setOpenSnackbar } = useContext(UIContext);
    const { sendMessage } = useContext(WebSocketContext);

    const [formOption, setFormOption] = useState<string>('');
    const [formOptionNew, setFormOptionNew] = useState<boolean>(false);
    const [changeMade, setChangeMade] = useState<boolean>(false);
    const [selectedFormOption, setSelectedFormOption] = useState<string>('');
    const [labelOption, setLabelOption] = useState<string>(selected.label || '');
    const [originalLabel, setOriginalLabel] = useState<string>('');
    const [editingFormOption, setEditingFormOption] = useState<string>('');

    const optionElement = document.getElementById('select-option') as HTMLOptionElement;

    useEffect(() => {
        setFormOptionNew(storedItems.find((item) => item.name === itemName)?.form_cfg.length !== formConfig.length);
    }, [formConfig, itemName, storedItems]);

    useEffect(() => {
        const storedItem = storedItems.filter(item => item.name === itemName)[0];
        if (!storedItem) return;
        if (_.isEqual(JSON.stringify(storedItem.form_cfg[selected.order]), JSON.stringify(selected))) {
            console.log('No changes detected')
            setChangeMade(false);
        }
        else {
            console.log('Changes detected')
            setChangeMade(true);
        }
    }, [selected, itemName, storedItems]);

    useEffect(() => {
        setOriginalLabel(selected.label);
    }, []);

    async function handleSave(newFormConfig: FormComponentConfig[]) {
        console.log('saving')
        const storedItem = storedItems.filter(item => item.name === itemName)[0];
        const itemExists = !!storedItem;

        if (itemExists && storedItem!.form_cfg.length === newFormConfig.length && !changeMade) {
            handleClosePopup();
            return;
        }

        const url = itemExists ? `/api/v1/items/update/${storedItem.id}/` : '/api/v1/items/create/';
        const axiosMethod = itemExists ? axios.patch : axios.post;
        console.log('newformconfig', newFormConfig)

        const payload = {
            "name": itemName,
            "form_cfg": newFormConfig,
            "category_id": categoryID,
            "tax_rate": taxRate,
            "inventory_config": inventory
        };

        try {
            const res = await axiosMethod(url, payload);
            setSnackbarMessage(`${itemName} ${itemExists ? 'Updated' : 'Saved'}!`);
            setOpenSnackbar(true);
            const newStoredItems = itemExists ? storedItems.map(item => item.name === itemName ? res.data : item) : [...storedItems, res.data];
            console.log('storing new items')
            console.log(res.data)
            setStoredItems(newStoredItems);
            // update entire form config to reflect changes
            setFormConfig(res.data.form_cfg);
            sendMessage(JSON.stringify({ type: 'items-update', payload: newStoredItems }));
            sendMessage(JSON.stringify({ type: 'config-update', payload: res.data.form_cfg[selected.order] }));
            handleClosePopup();
        } catch (err) {
            console.log(err);
            setSnackbarMessage(`Error ${itemExists ? 'Updating' : 'Saving'} Item`);
            setOpenSnackbar(true);
        }
    }

    const handleAddDelOptions = (mode: string, option: string, index: number = -1) => {
        if (option.trim() !== '') {
            if (mode === 'add' && selected.options.includes(option.trim())) {
                setSnackbarMessage('Option already exists');
                setOpenSnackbar(true);
                return;
            }

            // will need to check for all form components that have options
            setSelected((prevSelected: FormComponentConfig) => {
                const newSelected = { ...prevSelected };
                let updatedOptions;

                if (mode === 'add') {
                    // Add the new option at the specified index
                    if (index >= 0 && index <= newSelected.options.length) {
                        updatedOptions = [
                            ...newSelected.options.slice(0, index),
                            option.trim(),
                            ...newSelected.options.slice(index),
                        ];
                    } else {
                        // Default to appending if the index is out of bounds
                        updatedOptions = [...newSelected.options, option.trim()];
                    }
                } else {
                    updatedOptions = newSelected.options.filter((opt) => opt !== option);
                }

                newSelected.options = updatedOptions;
                return newSelected;
            });

            setFormOption('');
            setSelectedFormOption('');
            optionElement.value = '';
        }
    };

    const handleEditFormOption = () => {
        if (selectedFormOption === editingFormOption) {
            setEditingFormOption('');
            return;
        }
        const idx = selected.options.indexOf(selectedFormOption);

        // look through pricing config -> depends on to see if the value changed was used, if so, update it
        const newSelectedDependsOnValues = _.cloneDeep(selected.pricing_config.dependsOn!.values);

        Object.entries(newSelectedDependsOnValues).forEach(([mainKey, subObj]) => {
            if (mainKey === selectedFormOption) {
                newSelectedDependsOnValues[editingFormOption] = newSelectedDependsOnValues[mainKey];
                console.log(`setting new key ${editingFormOption} to ${newSelectedDependsOnValues[mainKey]}`);
                delete newSelectedDependsOnValues[mainKey];
            }
            Object.entries(subObj).forEach(([subKey, value]) => {
                if (subKey === selectedFormOption) {
                    newSelectedDependsOnValues[mainKey][editingFormOption] = value;
                    delete newSelectedDependsOnValues[mainKey][subKey];
                }
            });
        });

        setSelected((prevSelected: FormComponentConfig) => {
            const newSelected = {
                ...prevSelected,
                pricing_config: { ...prevSelected.pricing_config, dependsOn: { name: prevSelected.pricing_config.dependsOn!.name, values: newSelectedDependsOnValues } }
            };
            return newSelected;
        });

        handleAddDelOptions('add', editingFormOption, idx);
        handleAddDelOptions('delete', selectedFormOption);
        setEditingFormOption('');
    }


    useEffect(() => {
        setSelected((prevSelected: FormComponentConfig) => {
            const updatedSelected = { ...prevSelected, label: labelOption || '' };
            return updatedSelected;
        });

    }, [labelOption, setSelected]);

    const handleCancel = () => {
        // mismatch in lengths mean the form option is new / not yet saved. cancelling should remove it
        if (formOptionNew) {
            setFormConfig((prevFormConfig: FormComponentConfig[]) => {
                return prevFormConfig.slice(0, -1);
            });
        }
        handleClosePopup();
    };

    const handleFormComponentDelete = async () => {
        const newConfig = formConfig.filter((_, index) => index !== selected.order);
        // need to reset any pricing configs that depended on this component
        newConfig.map((comp) => {
            if (comp.pricing_config.dependsOn?.name === selected.label) {
                comp.pricing_config = { ...comp.pricing_config, dependsOn: { name: '', values: {} }, priceBy: '' };
            }
        });
        // also reset inventory config (depends on, decrementer, decrement depends on)
        if (inventory.dependsOn.name === selected.label) {
            setInventory({ ...inventory, dependsOn: { name: 'none', amounts: {} } });
        }

        if (inventory.decrementDependsOn.names.includes(selected.label)) {
            const updatedNames = inventory.decrementDependsOn.names.filter((name) => name !== selected.label);
            setInventory({ ...inventory, decrementDependsOn: { names: updatedNames, amounts: {} } });
        }

        if (inventory.decrementer === selected.label) {
            setInventory({ ...inventory, decrementer: '1_per_order' });
        }

        handleClosePopup();
        await handleSave(newConfig);
    };

    const handleOK = async () => {
        const newConfig = [...formConfig];
        newConfig[selected.order] = selected;
        if (originalLabel !== "") {
            const dependentComps = formConfig.filter((comp) => comp.pricing_config.dependsOn?.name === originalLabel);
            if (dependentComps.length > 0) {
                dependentComps.forEach((comp) => {
                    newConfig[comp.order].pricing_config.dependsOn!.name = selected.label;
                });
            }
        }
        // remove whitespace from options and label
        newConfig[selected.order].options = newConfig[selected.order].options.map((option: string) => option.trim());
        newConfig[selected.order].label = newConfig[selected.order].label.trim();
        await handleSave(newConfig);
    };

    const renderActionButtons = () => {
        return (
            <>
                <CenterGrid item xs={6}>
                    <ConfirmationButton onConfirmed={handleCancel} override={!changeMade} dialogContent={closeWithoutSaving} shiftAmount={DRAWER_WIDTH / 2}>Cancel</ConfirmationButton>
                </CenterGrid>

                <CenterGrid item xs={6}>
                    <ButtonWidest variant='contained' onClick={handleOK}>Ok</ButtonWidest>
                </CenterGrid>

                {!formOptionNew && (
                    <CenterGrid item xs={12}>
                        <ConfirmationButton onConfirmed={handleFormComponentDelete} dialogContent={formCompDelConfirm} shiftAmount={DRAWER_WIDTH / 2}>Delete</ConfirmationButton>
                    </CenterGrid>
                )}
            </>
        );
    }

    const renderCloseButton = () => {
        return (
            <CloseButton override={!changeMade} handleOnConfirmed={handleCancel} dialogContent={closeWithoutSaving} shiftAmount={DRAWER_WIDTH / 2} />
        )
    }

    // selected represents the specific form component that is being edited
    switch (selected.type) {
        case 'single_select':
            return (
                <CenterGrid container>
                    {renderCloseButton()}

                    <CenterGrid item xs={12}>
                        <Typography variant='h3' fontWeight='bold' mt={'8px'}>Preview</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <BasePreviewComponents component={selected} />
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
                            inputProps={{
                                style: {
                                    textOverflow: 'ellipsis',
                                    width: 'calc(100% - 5rem)' // Adjust this value as needed
                                }
                            }}
                        />
                        <IconButton
                            aria-label='add'
                            size='large'
                            style={{ position: 'absolute', top: 0, right: 0 }}
                            onClick={() => handleAddDelOptions('add', formOption)}
                        >
                            <AddOutlinedIcon fontSize='inherit' />
                        </IconButton>
                    </CenterGrid>

                    <CenterGrid item xs={12} style={{ position: 'relative' }}>
                        {!editingFormOption ? (
                            <TextField
                                select
                                fullWidth
                                label="Options"
                                variant="filled"
                                value={selectedFormOption}
                                onChange={(e) => setSelectedFormOption(e.target.value)}
                                SelectProps={{ style: { paddingRight: '4rem' } }}
                            >
                                <MenuItem value="">—</MenuItem>
                                {selected.options.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    label={`Edit Option: ${selectedFormOption}`}
                                    variant="filled"
                                    value={editingFormOption}
                                    onChange={(e) => setEditingFormOption(e.target.value !== '' ? e.target.value : selectedFormOption)}
                                />
                                <Fade in={editingFormOption !== ''}>
                                    <ButtonGroup
                                        variant="contained"
                                        style={{ position: 'absolute', top: '1.65rem', right: '2rem' }}
                                    >
                                        <Button sx={{ m: 0, fontSize: '1.15rem' }} onClick={handleEditFormOption}>SAVE</Button>
                                        <Button sx={{ m: 0, fontSize: '1.15rem' }} onClick={() => setEditingFormOption('')}>CANCEL</Button>
                                        <Button sx={{ m: 0, fontSize: '1.15rem' }} onClick={() => { handleAddDelOptions('delete', selectedFormOption); setEditingFormOption('') }}>DEL</Button>
                                    </ButtonGroup>
                                </Fade>
                            </>
                        )}

                        {selectedFormOption && !editingFormOption && (
                            <IconButton
                                size="large"
                                style={{ position: 'absolute', top: 0, right: '2rem' }}
                                onClick={() => setEditingFormOption(selectedFormOption)}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        )}
                    </CenterGrid>

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    <ConfigPricingSequence />

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    {renderActionButtons()}

                </CenterGrid>
            );
        case 'text':
        case 'number':
            return (
                <CenterGrid container>
                    {renderCloseButton()}

                    <CenterGrid item xs={12}>
                        <Typography variant='h3' fontWeight='bold' mt={'8px'}>Preview</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <BasePreviewComponents component={selected} />
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

                    <ConfigPricingSequence />

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    {renderActionButtons()}

                </CenterGrid>
            );
        case 'price':
            return (
                <CenterGrid container>
                    {renderCloseButton()}
                    <CenterGrid item xs={12} mt={'8px'} color='white'>-</CenterGrid>

                    <ConfigPricingSequence />

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    {renderActionButtons()}
                </CenterGrid>
            );
        default:
            return <CenterGrid container></CenterGrid>

    }
}