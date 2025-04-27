import React, { useState, useContext, useImperativeHandle, forwardRef, useEffect } from 'react';
import { CenterGrid, Divider, MenuItemSmaller, TextFieldSmaller } from '../Styled';
import { FormGroup, FormControlLabel, Typography, TextFieldProps, Autocomplete, InputAdornment } from '@mui/material';
import ControlledCheckbox from '../BaseComps/ControlledCheckbox';
import { FormConfigContext } from './contexts/FormConfigContext';
import { FadeWrapper } from './ConfigPricingSequence';
import { FormComponentConfig, InventoryDependency, InventoryDecrementDependency } from '../BaseComps/dbTypes';
import { ItemContext } from './contexts/ItemContext';
import { validateNumberOrRatio } from '../BaseComps/utils';


// Define common props for TextFieldSmaller
const commonTextFieldProps: Partial<TextFieldProps> = {
    fullWidth: true,
    variant: 'filled',
};

// Utility function to filter form config
const filterFormConfig = (
    formConfig: FormComponentConfig[],
    excludes: string[],
    includeType: boolean,
    type?: string
) => {
    return formConfig.filter(comp =>
        !excludes.includes(comp.label) &&
        (!type || (includeType ? comp.type === type : comp.type !== type))
    );
};

export interface InventoryRef {
    getInventoryConfig: () => { manageItemInventory: boolean; dependsOn: InventoryDependency; decrementDependsOn: InventoryDecrementDependency; decrementer: string; };
}

const ConfigInventoryManagement = forwardRef<InventoryRef>((_, ref) => {

    const [manageItemInventory, setManageItemInventory] = useState(false);
    const [dependsOn, setDependsOn] = useState<InventoryDependency>({ name: 'none', amounts: {} });
    const [decrementDependsOn, setDecrementDependsOn] = useState<InventoryDecrementDependency>({ names: [], amounts: {} });
    const [decrementer, setDecrementer] = useState('1_per_order');
    const { formConfig } = useContext(FormConfigContext);
    const [decrementDependsOnOptions, setDecrementDependsOnOptions] = useState<string[]>([]);
    const [decrementDependsOnCombo, setDecrementDependsOnCombo] = useState<{ value: string, isDisabled: boolean }>({ value: '', isDisabled: true });

    const defaultAmountKeys = {
        dependsOn: '',
        decrementDependsOnFirst: '',
        decrementDependsOnSecond: '',
    };

    const [currentAmountKeys, setCurrentAmountKeys] = useState<Record<string, string>>({ ...defaultAmountKeys });

    const getDecrementDependsOnComboState = (keys: Record<string, string>, { names, amounts }: InventoryDecrementDependency) => {
        let value = '';
        let isDisabled = true;
        console.log('names:', names);
        console.log('keys:', keys);
        if (names.length === 1) {
            isDisabled = keys.decrementDependsOnFirst === '';
            console.log('isDisabled:', isDisabled);
            value = !isDisabled ? amounts[keys.decrementDependsOnFirst] as string : '1';
        } else if (names.length === 2 && typeof amounts[keys.decrementDependsOnFirst] === 'object') {
            isDisabled = keys.decrementDependsOnFirst === '' || keys.decrementDependsOnSecond === '';
            console.log('isDisabled:', isDisabled);
            value = !isDisabled ? (amounts[keys.decrementDependsOnFirst] as Record<string, string>)[keys.decrementDependsOnSecond] : '1';
        }
        console.log('new value:', value);
        setDecrementDependsOnCombo({ value, isDisabled });
    };

    // current inventory state
    const { inventory } = useContext(ItemContext);

    const handleSelectChange = (setter: React.Dispatch<React.SetStateAction<InventoryDependency>>, name: string) => {
        const options = formConfig.find(comp => comp.label === name)?.options || [];
        const values = options.reduce((acc, key) => ({ ...acc, [key]: '0' }), {});
        setter({ name, amounts: values });
    };

    const handleAmountChange = (setter: React.Dispatch<React.SetStateAction<InventoryDependency>>, key: string, value: string) => {
        setter({
            ...dependsOn,
            amounts: {
                ...dependsOn.amounts,
                [key]: value
            }
        });
    }

    const handleDependsOnChange = (e: React.ChangeEvent<{ value: string }>) => {
        handleSelectChange(setDependsOn, e.target.value);
    };

    // handle changes to the "decrement depends on" selection
    const handleDecrementDependsOnChange = (_: React.SyntheticEvent, values: string[]) => {
        if (values.length > 2) return;

        if (decrementDependsOn.names.length > values.length || values.length === 0) {
            setCurrentAmountKeys(prev => ({ ...prev, ...defaultAmountKeys, dependsOn: prev.dependsOn }));
            setDecrementDependsOnCombo({ value: '', isDisabled: true });
        }

        const components = values.map(value => formConfig.find(comp => comp.label === value)).filter(Boolean) as FormComponentConfig[];

        if (components.length !== values.length) return;

        let amounts = {};

        // amounts is type Record<string, string> if only one dependency, otherwise Record<string, Record<string, string>>
        if (values.length > 0) {
            amounts = values.length === 1
                ? Object.fromEntries(components[0].options.map(option => [option, '1']))
                : Object.fromEntries(
                    components[0].options.map(option => [
                        option,
                        Object.fromEntries(components[1]?.options.map(subOption => [subOption, '1']) || [])
                    ])
                );
        }

        setDecrementDependsOn({ names: values, amounts });
    };

    // Handle changes to the "decrement depends on" amount value
    const handleDecrementDependsOnAmountChange = (value: string) => {
        console.log('new value:', value);
        const validationResult = validateNumberOrRatio(value);
        console.log('validation result:', validationResult);
        const validatedValue = validationResult.isValid ? validationResult.value || value : '';
        if (!validationResult.isValid) return;
        setDecrementDependsOn(prev => {
            if (prev.names.length === 1 && currentAmountKeys.decrementDependsOnFirst) {
                return {
                    ...prev,
                    amounts: {
                        ...prev.amounts,
                        [currentAmountKeys.decrementDependsOnFirst]: validatedValue
                    }
                };
            } else if (prev.names.length === 2) {
                console.log('names length is 2');
                return {
                    ...prev,
                    amounts: {
                        ...prev.amounts,
                        [currentAmountKeys.decrementDependsOnFirst]: {
                            ...(prev.amounts[currentAmountKeys.decrementDependsOnFirst] as Record<string, string>),
                            [currentAmountKeys.decrementDependsOnSecond]: validatedValue
                        }
                    }
                };
            }
            return prev;
        });
    };

    const handleChangeFormComponentOptions = (e: React.ChangeEvent<{ value: string }>, target: string) => {
        const newKeys = { ...currentAmountKeys, [target]: e.target.value };
        setCurrentAmountKeys(newKeys);
    };

    // expose inventory configuration to parent components via ref
    useImperativeHandle(ref, () => ({
        getInventoryConfig() {
            return {
                manageItemInventory,
                dependsOn,
                decrementDependsOn,
                decrementer,
            };
        }
    }), [manageItemInventory, dependsOn, decrementDependsOn, decrementer]);

    // initialize state based on inventory context
    useEffect(() => {
        if (!inventory) return;

        if (inventory.manageItemInventory) {
            setManageItemInventory(true);
            setDependsOn(inventory.dependsOn);
            setDecrementDependsOn(inventory.decrementDependsOn);
            setDecrementer(inventory.decrementer);
        }
    }, [inventory]);

    // update decrement depends on options when formConfig or decrementer changes
    useEffect(() => {
        const options = filterFormConfig(formConfig, [decrementer], true, 'single_select')
            .map(comp => comp.label);
        setDecrementDependsOnOptions(options);
    }, [formConfig, decrementer]);

    useEffect(() => {
        getDecrementDependsOnComboState(currentAmountKeys, decrementDependsOn);
    }, [currentAmountKeys, decrementDependsOn]);

    const renderFormComponentOptions = (label: string, target: string, value: string) => {
        return (
            <TextFieldSmaller
                {...commonTextFieldProps}
                label={label}
                select
                value={value}
                onChange={(e) => handleChangeFormComponentOptions(e, target)}
            >
                <MenuItemSmaller value="">—</MenuItemSmaller>
                {formConfig.find(comp => comp.label === label)?.options.map(option => (
                    <MenuItemSmaller key={option} value={option}>{option}</MenuItemSmaller>
                ))}
            </TextFieldSmaller>
        )
    };

    return (
        <CenterGrid container>
            {/* Manage Inventory Checkbox */}
            <CenterGrid item xs={12}>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <ControlledCheckbox
                                checked={manageItemInventory}
                                onChange={() => setManageItemInventory(prev => !prev)}
                            />
                        }
                        label={<Typography variant="h6">Manage this item's inventory?</Typography>}
                    />
                </FormGroup>
            </CenterGrid>

            {/* Depends On Selection */}
            <FadeWrapper condition={manageItemInventory} container>
                <CenterGrid item xs={12}>
                    <TextFieldSmaller
                        {...commonTextFieldProps}
                        label="Depends on. . ."
                        select
                        value={dependsOn.name}
                        onChange={handleDependsOnChange}
                    >
                        <MenuItemSmaller value="none">None</MenuItemSmaller>
                        {filterFormConfig(formConfig, [], true, 'single_select').map(comp => (
                            <MenuItemSmaller key={comp.order} value={comp.label}>{comp.label}</MenuItemSmaller>
                        ))}
                    </TextFieldSmaller>


                    {/* Decrementer Selection */}
                    <TextFieldSmaller
                        {...commonTextFieldProps}
                        label="Decrement by. . ."
                        select
                        value={decrementer}
                        onChange={(e) => { setDecrementer(e.target.value) }}
                    >
                        <MenuItemSmaller value={'1_per_order'}>1 per order</MenuItemSmaller>
                        {filterFormConfig(formConfig, [dependsOn.name, ...decrementDependsOn.names], false, 'price').map(comp => (
                            <MenuItemSmaller key={comp.order} value={comp.label}>{comp.label}</MenuItemSmaller>
                        ))}
                    </TextFieldSmaller>
                </CenterGrid>

                {/* Basic Amount Settings (No Dependency) */}
                <FadeWrapper condition={dependsOn.name === 'none'} xs={12}>
                    <TextFieldSmaller
                        {...commonTextFieldProps}
                        label="Amount available"
                        type="number"
                        value={dependsOn.amounts[''] || '0'} // using '' as key for basic amount, still in dependsOn.amounts
                        onChange={(e) => handleAmountChange(setDependsOn, '', e.target.value)}
                    />
                </FadeWrapper>

                {/* Depends On Amount Settings */}
                <FadeWrapper condition={dependsOn.name !== 'none'} xs={12}>
                    {renderFormComponentOptions(dependsOn.name, 'dependsOn', currentAmountKeys.dependsOn)}

                    <TextFieldSmaller
                        {...commonTextFieldProps}
                        label="Amount available"
                        type="number"
                        value={dependsOn.amounts[currentAmountKeys.dependsOn] || '0'}
                        onChange={(e) => handleAmountChange(setDependsOn, currentAmountKeys.dependsOn, e.target.value)}
                        disabled={currentAmountKeys.dependsOn === ''}
                    />
                </FadeWrapper>

                <Divider />

                {/* Decrementing Dependency Settings */}
                <FadeWrapper condition={decrementer !== '1_per_order'} container>
                    <Autocomplete
                        renderInput={(params) =>
                            <CenterGrid item xs={12}>
                                <TextFieldSmaller variant='filled' {...params} label="Decrementing depends on. . . (max 2)" />
                            </CenterGrid>}
                        options={decrementDependsOnOptions}
                        value={decrementDependsOn.names}
                        getOptionLabel={(option) => option}
                        disableCloseOnSelect
                        multiple
                        fullWidth
                        onChange={handleDecrementDependsOnChange}
                        renderOption={(props, option, { selected }) => (
                            <MenuItemSmaller {...props} selected={selected}>
                                {option}
                            </MenuItemSmaller>
                        )}
                    />

                    <FadeWrapper condition={decrementDependsOn.names.length > 0} container>
                        <CenterGrid item xs={12}>
                            {renderFormComponentOptions(decrementDependsOn.names[0], 'decrementDependsOnFirst', currentAmountKeys.decrementDependsOnFirst)}

                            {decrementDependsOn.names.length === 2 && (
                                <>
                                    <Typography variant='h6'>&</Typography>
                                    {renderFormComponentOptions(decrementDependsOn.names[1], 'decrementDependsOnSecond', currentAmountKeys.decrementDependsOnSecond)}
                                </>
                            )}
                        </CenterGrid>


                        <TextFieldSmaller
                            {...commonTextFieldProps}
                            label="Decrement by multiplied by. . . (accepts ratio)"
                            value={decrementDependsOnCombo.value || ''}
                            onChange={(e) => handleDecrementDependsOnAmountChange(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Typography variant='h6'>×</Typography></InputAdornment>,
                            }}
                            disabled={decrementDependsOnCombo.isDisabled}
                        />

                    </FadeWrapper>
                </FadeWrapper>
            </FadeWrapper>
        </CenterGrid>
    );
});

export default ConfigInventoryManagement;
