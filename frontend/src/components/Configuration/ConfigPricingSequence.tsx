import React, { useState, useContext, useEffect, useRef, useReducer, useMemo } from 'react';
import { FormGroup, InputAdornment, Box, Fade, Typography } from '@mui/material';
import { CenterGrid, FormControlLabel, TextField, MenuItem, Divider } from '../Styled';
import ControlledCheckbox from '../BaseComps/ControlledCheckbox';
import { FormConfigContext } from './contexts/FormConfigContext';
import { Dependency, PricingConfig } from '../BaseComps/dbTypes';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

// Types
type FormOption = {
    label: string;
    value: string | number;
};

interface BaseTextFieldProps {
    label: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fullWidth?: boolean;
    variant?: 'filled' | 'outlined' | 'standard';
    select?: boolean;
    disabled?: boolean;
    options?: { value: string, label: string }[];
    InputProps?: Record<string, any>;
    SelectProps?: Record<string, any>;
    extraProps?: Record<string, any>;
}

interface FadeWrapperProps {
    condition: boolean;
    timeout: number;
    children: React.ReactNode;
    xs: number;
}

// Constants
const ActionType: Record<string, string> = {
    SetAffectsPrice: 'SetAffectsPrice',
    SetDependsOn: 'SetDependsOn',
    SetPriceFactor: 'SetPriceFactor',
    SetPriceBy: 'SetPriceBy',
    SetConstantValue: 'SetConstantValue',
    SetPerOptionMapping: 'SetPerOptionMapping',
    SetFullConfig: 'SetFullConfig',
    Reset: 'Reset',
};

const defaultState: PricingConfig = {
    affectsPrice: false,
    dependsOn: { name: '', values: {} },
    priceFactor: '',
    priceBy: '',
    constantValue: '0',
    perOptionMapping: {},
};

// Components
const BaseTextField = ({ label, value, onChange, fullWidth = true, variant = 'filled', select = false, disabled = false, options = [], InputProps = {}, SelectProps = {}, extraProps = {} }: BaseTextFieldProps) => (
    <TextField
        select={select}
        fullWidth={fullWidth}
        variant={variant}
        label={label}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...extraProps}
        InputProps={InputProps}
        SelectProps={SelectProps}
    >
        {select && options.map(option => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
    </TextField>
);

const FadeWrapper = ({ condition, timeout, children, xs }: FadeWrapperProps) => (
    condition ? (
        <Fade in={condition} timeout={timeout}>
            <CenterGrid item xs={xs}>
                {children}
            </CenterGrid>
        </Fade>
    ) : null
);

// Reducer
function pricingReducer(state: PricingConfig, action: { type: string, payload?: any, clear?: boolean }) {
    switch (action.type) {
        case ActionType.SetAffectsPrice:
            return { ...state, affectsPrice: action.payload };
        case ActionType.SetDependsOn:
            return { ...state, dependsOn: action.payload };
        case ActionType.SetPriceFactor:
            return { ...state, priceFactor: action.payload };
        case ActionType.SetPriceBy:
            return { ...state, priceBy: action.payload };
        case ActionType.SetConstantValue:
            return { ...state, constantValue: action.payload };
        case ActionType.SetPerOptionMapping:
            if (action.clear) {
                return { ...state, perOptionMapping: {} };
            }
            return { ...state, perOptionMapping: { ...state.perOptionMapping, ...action.payload } };
        case ActionType.Reset:
            return { ...defaultState, affectsPrice: state.affectsPrice };
        case ActionType.SetFullConfig:
            const temp = { ...action.payload };
            return { ...temp, perOptionMapping: { ...action.payload.perOptionMapping } };
        default:
            return state;
    }
}

// Helper Functions
function calculateGridSizes(config: { affectsPrice: boolean, dependsOn?: Dependency, priceBy?: string }) {
    const { affectsPrice, dependsOn, priceBy } = config;

    return {
        affectsPriceGridSize: affectsPrice === false ? 12 : (!(priceBy === 'Per Option' || priceBy === 'Option Value') && priceBy ? 6 : 4.2),
        dependsOnGridSize: dependsOn?.name ? 6 : (!dependsOn?.name && !(priceBy === 'Per Option' || priceBy === 'Option Value') && priceBy) ? 6 : 3.8,
        priceByGridSize: priceBy !== 'Per Option' && priceBy !== 'Option Value' && priceBy ? 6 : 4,
    };
}

function useGridSizes(config: { affectsPrice: boolean, dependsOn?: Dependency, priceBy?: string }) {
    return useMemo(() => calculateGridSizes(config), [config]);
}

// Main Component
function ConfigPricingSequence() {
    const [valueError, setValueError] = useState<boolean>(false);
    const [dependsOnCompOptions, setDependsOnCompOptions] = useState<Record<string, FormOption[]>>({});
    const inputRef = useRef<HTMLInputElement>(null);

    const { setSelected, selected, formConfig } = useContext(FormConfigContext);
    const initialState = selected.pricing_config;
    const [state, dispatch] = useReducer(pricingReducer, initialState);

    const [selectedFormOptions, setSelectedFormOptions] = useState<Record<string, string>>({});

    const price_by_options = selected.type.includes('select') ? ["Per Option", "Option Value", "Constant", "Scaled Option Value"] : ["Constant"];

    const commonNumberFieldProps = {
        inputRef: inputRef,
        onFocus: () => {
            if (inputRef.current) {
                inputRef.current.select();
            }
        },
        type: 'number',
        error: valueError,
        InputProps: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>
        }
    };

    useEffect(() => {
        if (!state.affectsPrice) {
            dispatch({ type: ActionType.Reset });
        }
    }, [state.affectsPrice]);

    useEffect(() => {
        const updatedDependsOnCompOptions: Record<string, FormOption[]> = {};
        const updatedSelectedFormOptions: Record<string, string> = { 'Self': '', 'Per Option': '' };
        const dependency = state.dependsOn;
        const depConfig = formConfig.find(config => config.label === dependency.name);
        if (depConfig) {
            updatedDependsOnCompOptions[dependency.name] = depConfig.options.map(opt => ({ label: opt, value: opt }));
            updatedSelectedFormOptions[dependency.name] = '';
        }
        if (selected.options.length > 0) {
            updatedDependsOnCompOptions['Per Option'] = selected.options.map(opt => ({ label: opt, value: opt }));
        }
        setDependsOnCompOptions(updatedDependsOnCompOptions);
        setSelectedFormOptions(updatedSelectedFormOptions);
    }, [state.dependsOn, formConfig, selected.options]);

    useEffect(() => {
        if (state.priceBy) {
            let priceFactor = '';
            if (state.priceBy !== 'Dependency') {
                const substrings = ["Option Value"];
                const included = substrings.some((option) => state.priceBy.includes(option));
                priceFactor = included ? '×' : '+';
            } else {
                priceFactor = selected.pricing_config.priceFactor || '';
            }
            dispatch({ type: ActionType.SetPriceFactor, payload: priceFactor });
        }
    }, [state.priceBy]);

    useEffect(() => {
        if (state === selected.pricing_config) return;

        const pricingConfig: PricingConfig = {
            affectsPrice: state.affectsPrice,
            dependsOn: state.dependsOn,
            priceFactor: state.priceFactor,
            priceBy: state.priceBy,
            constantValue: state.constantValue,
            perOptionMapping: state.perOptionMapping,
        };

        setSelected((prevState) => ({ ...prevState, pricing_config: pricingConfig }));
        console.log('Pricing Config:', pricingConfig);
    }, [state, selected.options, setSelected]);

    const validateNumber = (value: string) => {
        if (/^\d*\.?\d*$/.test(value)) {
            return true;
        }
        setValueError(true);
        return false;
    }

    const handleConstantValueChange = (value: string) => {
        if (validateNumber(value)) {
            dispatch({ type: ActionType.SetConstantValue, payload: value });
            setValueError(false);

            if (Object.keys(state.perOptionMapping).length > 0) {
                dispatch({ type: ActionType.SetPerOptionMapping, payload: {}, clear: true });
            }
        }
    };

    const handlePerMappingChange = (option: string, value: string) => {
        if (validateNumber(value)) {
            setValueError(false);
            dispatch({ type: ActionType.SetPerOptionMapping, payload: { [option]: value } });

            if (state.constantValue) {
                dispatch({ type: ActionType.SetConstantValue, payload: '0' });
            }
        }
    }

    const handleDependsOnChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedValue = event.target.value as string;
        const updatedDependsOn = {
            name: selectedValue,
            values: selected.options.reduce<Record<string, Record<string, string>>>((acc, option) => {
                const nestedOptions = formConfig.find(config => config.label === selectedValue)?.options.reduce<Record<string, string>>((innerAcc, innerOption) => {
                    innerAcc[innerOption] = '0';
                    return innerAcc;
                }, {}) || {};

                acc[option] = nestedOptions;
                return acc;
            }, {})
        };

        dispatch({ type: ActionType.SetDependsOn, payload: updatedDependsOn });
        dispatch({ type: ActionType.SetPriceBy, payload: 'Dependency' });
    }

    const handleDependencyValueChange = (option: string, value: string) => {
        const updatedDependsOn = { ...state.dependsOn };
        const selfSelected = selectedFormOptions['Self'];
        updatedDependsOn.values[selfSelected][option] = value;
        dispatch({ type: ActionType.SetDependsOn, payload: updatedDependsOn });
    }

    const handleOptionChange = (dependency: string, value: string) => {
        setSelectedFormOptions(prevOptions => ({
            ...prevOptions,
            [dependency]: value
        }));
    };

    const requiresConstantValue = state.priceBy === 'Constant' || state.priceBy === 'Scaled Option Value';

    const config = { affectsPrice: state.affectsPrice, dependsOn: state.dependsOn, priceBy: state.priceBy };
    const { affectsPriceGridSize, dependsOnGridSize, priceByGridSize } = useGridSizes(config);

    return (
        <CenterGrid container>
            <CenterGrid item xs={affectsPriceGridSize}>
                <Box sx={{ textAlign: 'center' }}>
                    <FormGroup>
                        <FormControlLabel
                            control={<ControlledCheckbox checked={state.affectsPrice} onChange={(e) => dispatch({ type: ActionType.SetAffectsPrice, payload: e.target.checked })} />}
                            label="Affects Price?"
                        />
                    </FormGroup>
                </Box>
            </CenterGrid>

            <FadeWrapper condition={state.affectsPrice} timeout={500} xs={dependsOnGridSize}>
                <BaseTextField
                    select
                    label="Depends on"
                    value={state.dependsOn.name || ''}
                    onChange={handleDependsOnChange}
                    options={[
                        { value: '', label: '—' },
                        ...formConfig.filter(config => config.label !== selected.label).map(config => ({
                            value: config.label,
                            label: config.label
                        }))
                    ]}
                />
            </FadeWrapper>

            <FadeWrapper condition={state.dependsOn.name} timeout={500} xs={12}>
                <CenterGrid item xs={6}>
                    <BaseTextField
                        select
                        label={`Self options`}
                        value={selectedFormOptions['Self'] ?? ''}
                        onChange={(e) => handleOptionChange('Self', e.target.value)}
                        options={selected.options.map(option => ({ value: option, label: option }))}
                    />
                </CenterGrid>

                <CenterGrid item xs={6}>
                    <BaseTextField
                        select
                        label={`${state.dependsOn.name} options`}
                        value={selectedFormOptions[state.dependsOn.name] || ''}
                        onChange={(e) => handleOptionChange(state.dependsOn.name, e.target.value)}
                        options={dependsOnCompOptions[state.dependsOn.name]?.map(option => ({ value: option.value.toString(), label: option.label })) || []}
                    />
                </CenterGrid>
            </FadeWrapper>

            <FadeWrapper condition={state.dependsOn.name} timeout={500} xs={12}>
                <CenterGrid item xs={6}>
                    <BaseTextField
                        label={`Self = ${selectedFormOptions['Self'] || 'N/A'}, ${state.dependsOn.name} = ${selectedFormOptions[state.dependsOn.name] || 'N/A'}`}
                        value={state.dependsOn.values[selectedFormOptions['Self']]?.[selectedFormOptions[state.dependsOn.name]] || '0'}
                        onChange={(e) => handleDependencyValueChange(selectedFormOptions[state.dependsOn.name], e.target.value)}
                        extraProps={{ ...commonNumberFieldProps }}
                        InputProps={{ ...commonNumberFieldProps.InputProps, startAdornment: <InputAdornment position="start"><Typography variant='h4'>{state.priceFactor}</Typography></InputAdornment> }}
                    />
                </CenterGrid>
                <CenterGrid item xs={6}>
                    <BaseTextField
                        label={`Price Factor`}
                        value={state.priceFactor || ''}
                        select
                        onChange={(e) => dispatch({ type: ActionType.SetPriceFactor, payload: e.target.value })}
                        options={['+', '×'].map(option => ({ value: option, label: option }))}
                    />
                </CenterGrid>
            </FadeWrapper>

            <FadeWrapper condition={state.affectsPrice && !state.dependsOn.name} timeout={500} xs={priceByGridSize}>
                <BaseTextField
                    select
                    label="By what?"
                    value={state.priceBy}
                    onChange={(e) => dispatch({ type: ActionType.SetPriceBy, payload: e.target.value })}
                    options={price_by_options.map(option => ({ value: option, label: option }))}
                />
            </FadeWrapper>

            <FadeWrapper condition={requiresConstantValue} timeout={500} xs={6}>
                <BaseTextField
                    label={state.priceBy === 'Constant' ? 'Fixed Price' : 'Scale by?'}
                    value={state.constantValue ?? '0'}
                    onChange={(e) => handleConstantValueChange(e.target.value)}
                    InputProps={
                        state.priceBy === 'Constant' ?
                            commonNumberFieldProps.InputProps : // Default adornment for 'Constant'
                            {
                                ...commonNumberFieldProps.InputProps, // Spread existing props
                                startAdornment: (
                                    <InputAdornment position="start"><Typography variant='h4'>{state.priceFactor}</Typography></InputAdornment>
                                )
                            }
                    }
                    extraProps={{ ...commonNumberFieldProps }}
                />
            </FadeWrapper>

            {['Per Option', 'Dependency'].map(type => (
                <React.Fragment key={type}>
                    <FadeWrapper condition={state.priceBy === type && !state.dependsOn.name} timeout={500} xs={12}>
                        <Divider />
                    </FadeWrapper>
                    <FadeWrapper condition={state.priceBy === type && !state.dependsOn.name} timeout={500} xs={6}>
                        <BaseTextField
                            select
                            label="Options"
                            value={selectedFormOptions['Per Option'] || ''}
                            onChange={(e) => handleOptionChange('Per Option', e.target.value)}
                            options={dependsOnCompOptions['Per Option']?.map(option => ({ value: option.value.toString(), label: option.label })) || []}
                        />
                    </FadeWrapper>
                    <FadeWrapper condition={state.priceBy === type && !state.dependsOn.name} timeout={500} xs={6}>
                        <BaseTextField
                            label={state.priceBy === 'Per Option' ? 'Price' : 'Price Factor'}
                            disabled={!selectedFormOptions['Per Option']}
                            value={selectedFormOptions['Per Option'] ? state.perOptionMapping[selectedFormOptions['Per Option']] ?? (state.priceBy === 'Per Option' ? '0' : '1') : ''}
                            onChange={(e) => handlePerMappingChange(selectedFormOptions['Per Option'], e.target.value)}
                            InputProps={
                                state.priceBy === 'Per Option' ?
                                    commonNumberFieldProps.InputProps : // Default adornment for 'Constant'
                                    {
                                        ...commonNumberFieldProps.InputProps, // Spread existing props
                                        startAdornment: (
                                            <InputAdornment position="start"><Typography variant='h4'>{state.priceFactor}</Typography></InputAdornment>
                                        )
                                    }
                            }
                            extraProps={{ ...commonNumberFieldProps }}
                        />
                    </FadeWrapper>
                </React.Fragment>
            ))}
        </CenterGrid>
    );
}

export default ConfigPricingSequence;
