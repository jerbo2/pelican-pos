import React, { useState, useContext, useEffect, useRef, useReducer, useMemo, useCallback } from 'react';
import { FormGroup, InputAdornment, Box, Fade, Typography } from '@mui/material';
import { CenterGrid, FormControlLabel, TextField, MenuItem, Divider } from '../Styled';
import ControlledCheckbox from '../BaseComps/ControlledCheckbox';
import { FormConfigContext } from './contexts/FormConfigContext';
import { Dependency, FormComponentConfig, PricingConfig } from '../BaseComps/dbTypes';
import _ from 'lodash';

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

const ActionType: Record<string, string> = {
    SetAffectsPrice: 'SetAffectsPrice',
    SetIsBasePrice: 'SetIsBasePrice',
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
    isBasePrice: false,
    dependsOn: { name: '', values: {} },
    priceFactor: '',
    priceBy: '',
    constantValue: '0',
    perOptionMapping: {},
};

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
        {select && options.map((option, index) => (
            <MenuItem key={`${label}_${option.value}_${index}`} value={option.value}>{option.label}</MenuItem>
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

function pricingReducer(state: PricingConfig, action: { type: string, payload?: any, clear?: boolean }) {
    switch (action.type) {
        case ActionType.SetAffectsPrice:
            return { ...state, affectsPrice: action.payload };
        case ActionType.SetIsBasePrice:
            return { ...state, isBasePrice: action.payload };
        case ActionType.SetDependsOn:
            return { ...state, dependsOn: action.payload };
        case ActionType.SetPriceFactor:
            return { ...state, priceFactor: action.payload };
        case ActionType.SetPriceBy:
            return { ...state, priceBy: action.payload };
        case ActionType.SetConstantValue:
            return { ...state, constantValue: action.payload };
        case ActionType.SetPerOptionMapping:
            return action.clear ? { ...state, perOptionMapping: {} } : { ...state, perOptionMapping: { ...state.perOptionMapping, ...action.payload } };
        case ActionType.Reset:
            return { ...defaultState, affectsPrice: state.affectsPrice };
        case ActionType.SetFullConfig:
            return {
                ...action.payload,
                perOptionMapping: JSON.parse(JSON.stringify(action.payload.perOptionMapping))
            };
        default:
            return state;
    }
}

const calculateGridSizes = (config: { dependsOn?: Dependency, priceBy?: string }) => {
    const { dependsOn, priceBy } = config;

    return {
        dependsOnGridSize: dependsOn?.name ? 12 : (!(dependsOn?.name) && !(priceBy === 'Per Option' || priceBy === 'Option Value') && priceBy) ? 4 : 6,
        priceByGridSize: priceBy !== 'Per Option' && priceBy !== 'Option Value' && priceBy ? 4 : 6,
    };
};

const validateNumberOrRatio = (input: string) => {
    const numberRegex = /^\d*\.?\d*$/;
    const ratioRegex = /^\((\d*\.?\d+)\s*\/\s*(\d*\.?\d+)\)$/;
    const partialRatioRegex = /^\((\d*\.?\d*)\s*\/?\s*(\d*\.?\d*)\)?$/;

    if (numberRegex.test(input)) {
        return { isValid: true, isPartial: false, value: input };
    }

    const ratioMatch = input.match(ratioRegex);
    if (ratioMatch) {
        const numerator = parseFloat(ratioMatch[1]);
        const denominator = parseFloat(ratioMatch[2]);
        if (denominator !== 0) {
            return { isValid: true, isPartial: false, value: (numerator / denominator).toString() };
        }
    }

    const partialRatioMatch = input.match(partialRatioRegex);
    if (partialRatioMatch) {
        return { isValid: true, isPartial: true, value: null };
    }

    return { isValid: false, isPartial: false, value: null };
};

const createDependsOnMapping = (selectedValue: string, selectedOptions: string[], formConfig: FormComponentConfig[]) => {
    const depConfig = formConfig.find(config => config.label === selectedValue);

    return {
        name: selectedValue,
        values: selectedOptions.reduce<Record<string, Record<string, string>>>((acc, option) => {
            const nestedOptions = depConfig?.options.reduce<Record<string, string>>((innerAcc, innerOption) => {
                innerAcc[innerOption] = '0';
                return innerAcc;
            }, {}) || {};
            acc[option] = nestedOptions;
            return acc;
        }, {})
    };
};

const useGridSizes = (config: { dependsOn?: Dependency, priceBy?: string }) => {
    return useMemo(() => calculateGridSizes(config), [config]);
};

function ConfigPricingSequence() {
    const [valueError, setValueError] = useState<boolean>(false);
    const [dependsOnCompOptions, setDependsOnCompOptions] = useState<Record<string, FormOption[]>>({});
    const inputRef = useRef<HTMLInputElement>(null);

    const { setSelected, selected, formConfig } = useContext(FormConfigContext);
    const initialState = selected.pricing_config;
    const [state, dispatch] = useReducer(pricingReducer, initialState);

    const [selectedFormOptions, setSelectedFormOptions] = useState<Record<string, string>>({ 'Self': '', 'Per Option': '' });

    const priceByOptions = useMemo(() => selected.type.includes('select') ? ["Per Option", "Option Value", "Constant", "Scaled Option Value"] : ["Constant"], [selected.type]);

    const commonNumberFieldProps = useMemo(() => ({
        inputRef: inputRef,
        onFocus: () => inputRef.current?.select(),
        type: 'number',
        error: valueError,
        InputProps: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>
        }
    }), [valueError]);

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
    }, [formConfig, selected.options, state.dependsOn.name]);

    useEffect(() => {
        if (state.priceBy) {
            let priceFactor = '';
            if (state.priceBy !== 'Dependency') {
                const substrings = ["Option Value"];
                const included = substrings.some((option) => state.priceBy.includes(option));
                priceFactor = included ? '×' : '+';
            } else {
                priceFactor = selected.pricing_config.priceFactor || '+';
            }
            dispatch({ type: ActionType.SetPriceFactor, payload: priceFactor });
        }
    }, [state.priceBy, selected.pricing_config.priceFactor]);

    useEffect(() => {
        if (!_.isEqual(state, selected.pricing_config)) {
            setSelected(prev => ({ ...prev, pricing_config: state }));
        }
    }, [state, selected.pricing_config, setSelected]);

    const handleConstantValueChange = useCallback((value: string) => {
        const validationResult = validateNumberOrRatio(value);
        if (validationResult.isValid) {
            dispatch({ type: ActionType.SetConstantValue, payload: value });
            setValueError(false);

            if (Object.keys(state.perOptionMapping).length > 0) {
                dispatch({ type: ActionType.SetPerOptionMapping, payload: {}, clear: true });
            }
        }
    }, [state.perOptionMapping]);

    const handlePerMappingChange = useCallback((option: string, value: string) => {
        const validationResult = validateNumberOrRatio(value);
        if (validationResult.isValid) {
            setValueError(false);
            dispatch({ type: ActionType.SetPerOptionMapping, payload: { [option]: value } });

            if (state.constantValue) {
                dispatch({ type: ActionType.SetConstantValue, payload: '0' });
            }
        }
    }, [state.constantValue]);

    const handleDependsOnChange = useCallback((event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedValue = event.target.value as string;

        if (selectedValue === '') {
            dispatch({ type: ActionType.SetPriceBy, payload: '' });
            dispatch({ type: ActionType.SetDependsOn, payload: { name: '', values: {} } });
            return;
        }

        const updatedDependsOn = createDependsOnMapping(selectedValue, selected.options, formConfig);
        dispatch({ type: ActionType.SetDependsOn, payload: updatedDependsOn });
        dispatch({ type: ActionType.SetPriceBy, payload: 'Dependency' });
        dispatch({ type: ActionType.SetIsBasePrice, payload: false });
    }, [selected.options, formConfig]);

    const handleDependencyValueChange = useCallback((option: string, value: string) => {
        const validationResult = validateNumberOrRatio(value);
        if (!validationResult.isValid) {
            return;
        }
        const updatedValue = validationResult.value || value;
        const updatedDependsOn = {
            ...state.dependsOn,
            values: {
                ...state.dependsOn.values,
                [selectedFormOptions['Self']]: {
                    ...state.dependsOn.values[selectedFormOptions['Self']],
                    [option]: updatedValue
                }
            }
        };
        dispatch({ type: ActionType.SetDependsOn, payload: updatedDependsOn });
    }, [state.dependsOn, selectedFormOptions]);

    const handleOptionChange = useCallback((dependency: string, value: string) => {
        setSelectedFormOptions(prevOptions => ({
            ...prevOptions,
            [dependency]: value
        }));
    }, []);

    const requiresConstantValue = useMemo(() => state.priceBy === 'Constant' || state.priceBy === 'Scaled Option Value', [state.priceBy]);
    const isBasePriceOption = useMemo(() => state.affectsPrice && !['Option Value', 'Dependency'].some(option => state.priceBy.includes(option)), [state.affectsPrice, state.priceBy]);

    const gridConfig = useMemo(() => ({ affectsPrice: state.affectsPrice, dependsOn: state.dependsOn, priceBy: state.priceBy }), [state.affectsPrice, state.dependsOn, state.priceBy]);
    const { dependsOnGridSize, priceByGridSize } = useGridSizes(gridConfig);

    return (
        <CenterGrid container>
            <CenterGrid item xs={isBasePriceOption ? 6 : 12}>
                <Box sx={{ textAlign: 'center' }}>
                    <FormGroup>
                        <FormControlLabel
                            control={<ControlledCheckbox checked={state.affectsPrice} onChange={(e) => dispatch({ type: ActionType.SetAffectsPrice, payload: e.target.checked })} />}
                            label="Affects Price?"
                        />
                    </FormGroup>
                </Box>
            </CenterGrid>

            <FadeWrapper condition={isBasePriceOption} timeout={500} xs={6}>
                <Box sx={{ textAlign: 'center' }}>
                    <FormGroup>
                        <FormControlLabel
                            control={<ControlledCheckbox disabled={false} checked={state.isBasePrice} onChange={(e) => dispatch({ type: ActionType.SetIsBasePrice, payload: e.target.checked })} />}
                            label="Base Price?"
                        />
                    </FormGroup>
                </Box>
            </FadeWrapper>

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

            <FadeWrapper condition={state.dependsOn.name !== ''} timeout={500} xs={12}>
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

            <FadeWrapper condition={state.dependsOn.name !== ''} timeout={500} xs={12}>
                <CenterGrid item xs={6}>
                    <BaseTextField
                        label={`Self = ${selectedFormOptions['Self'] || 'N/A'}, ${state.dependsOn.name} = ${selectedFormOptions[state.dependsOn.name] || 'N/A'}`}
                        value={state.dependsOn.values[selectedFormOptions['Self']]?.[selectedFormOptions[state.dependsOn.name]] || '0'}
                        onChange={(e) => handleDependencyValueChange(selectedFormOptions[state.dependsOn.name], e.target.value)}
                        InputProps={{ ...commonNumberFieldProps.InputProps, startAdornment: <InputAdornment position="start"><Typography variant='h4'>{state.priceFactor || '+'}</Typography></InputAdornment> }}
                    />
                </CenterGrid>
                <CenterGrid item xs={6}>
                    <BaseTextField
                        label={`Price Factor`}
                        value={state.priceFactor || '+'}
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
                    options={priceByOptions.map(option => ({ value: option, label: option }))}
                />
            </FadeWrapper>

            <FadeWrapper condition={requiresConstantValue} timeout={500} xs={4}>
                <BaseTextField
                    label={state.priceBy === 'Constant' ? 'Fixed Price' : 'Scale by?'}
                    value={state.constantValue ?? '0'}
                    onChange={(e) => handleConstantValueChange(e.target.value)}
                    InputProps={state.priceBy === 'Constant' ? commonNumberFieldProps.InputProps : {
                        ...commonNumberFieldProps.InputProps,
                        startAdornment: (
                            <InputAdornment position="start"><Typography variant='h4'>{state.priceFactor}</Typography></InputAdornment>
                        )
                    }}
                    extraProps={{ ...commonNumberFieldProps }}
                />
            </FadeWrapper>

            {['Per Option', 'Dependency'].map(type => (
                <React.Fragment key={`${type}_map`}>
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
                            InputProps={state.priceBy === 'Per Option' ? commonNumberFieldProps.InputProps : {
                                ...commonNumberFieldProps.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start"><Typography variant='h4'>{state.priceFactor}</Typography></InputAdornment>
                                )
                            }}
                            extraProps={{ ...commonNumberFieldProps }}
                        />
                    </FadeWrapper>
                </React.Fragment>
            ))}

        </CenterGrid>
    );
}

export default ConfigPricingSequence;
