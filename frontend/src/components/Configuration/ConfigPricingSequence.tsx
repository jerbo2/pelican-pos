import { useState, useContext, useEffect, useRef, useReducer } from 'react';
import { FormGroup, InputAdornment } from '@mui/material';
import { CenterGrid, FormControlLabel, TextField, MenuItem, Divider } from '../Styled';
import ControlledCheckbox from '../BaseComps/ControlledCheckbox';
import { FormConfigContext } from './contexts/FormConfigContext';
import { PricingConfig } from '../BaseComps/dbTypes';
import Fade from '@mui/material/Fade';

// Define action types
const ActionType: Record<string, string> = {
    SetAffectsPrice: 'SetAffectsPrice',
    SetPriceFactor: 'SetPriceFactor',
    SetPriceBy: 'SetPriceBy',
    SetConstantValue: 'SetConstantValue',
    SetPerOptionMapping: 'SetPerOptionMapping',
    SetFullConfig: 'SetFullConfig',
    Reset: 'Reset',
};

// Reducer function for managing state
function pricingReducer(state: PricingConfig, action: { type: string, payload?: any, clear?: boolean }) {
    switch (action.type) {
        case ActionType.SetAffectsPrice:
            return { ...state, affectsPrice: action.payload };
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
            return { ...defaultState, affectsPrice: state.affectsPrice };  // Maintains affectsPrice, resets others
        case ActionType.SetFullConfig:
            //payload has perOptionMapping which is a dict, need to make sure those vals are preserved
            const temp = {...action.payload};
            return {...temp, perOptionMapping: {...action.payload.perOptionMapping}};
        default:
            return state;
    }
}

const defaultState: PricingConfig = {
    affectsPrice: false,
    priceFactor: '',
    priceBy: '',
    constantValue: '0',
    perOptionMapping: {},
};

function ConfigPricingSequence() {
    const [valueError, setValueError] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { setSelected, selected } = useContext(FormConfigContext);
    const initialState = selected.pricing_config;
    const [state, dispatch] = useReducer(pricingReducer, initialState);

    const [selectedFormOption, setSelectedFormOption] = useState<string>('');

    const price_factor_options = ["+", "*"];
    const price_by_options = selected.type.includes('select') ? ["Per Option", "Option Value", "Constant"] : ["Constant"];

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
        console.log('triggered');

        if (state === selected.pricing_config) return

        const pricingConfig: PricingConfig = {
            affectsPrice: state.affectsPrice,
        };

        if (state.affectsPrice) {
            console.log('doing thing')
            pricingConfig.priceFactor = state.priceFactor;
            pricingConfig.priceBy = state.priceBy;
            pricingConfig.constantValue = state.constantValue;
            pricingConfig.perOptionMapping = state.perOptionMapping;
            setSelected((prevState) => ({ ...prevState, pricing_config: pricingConfig }));
        }

    }, [state]); // only track those two, if they're filled in that indicates the user has finished configuring the pricing

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

    return (
        <>
            <CenterGrid item xs={!state.affectsPrice ? 12 : 3}>
                <FormGroup>
                    <FormControlLabel
                        control={<ControlledCheckbox checked={state.affectsPrice} onChange={(e) => dispatch({ type: ActionType.SetAffectsPrice, payload: e.target.checked })} />}
                        label="Affects Price?"
                    />
                </FormGroup>
            </CenterGrid>

            {state.affectsPrice && (
                <Fade in={state.affectsPrice} timeout={500}>
                    <CenterGrid item xs={!(state.priceBy === 'Constant') ? 3 : 2}>
                        <TextField
                            select
                            fullWidth
                            variant='filled'
                            label='Factor?'
                            value={state.priceFactor}
                            onChange={(e) => dispatch({ type: ActionType.SetPriceFactor, payload: e.target.value })}
                        >
                            {price_factor_options.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </CenterGrid>
                </Fade>
            )}

            {state.priceFactor && (
                <Fade in={state.priceFactor !== ''} timeout={500}>
                    <CenterGrid item xs={!(state.priceBy === 'Constant') ? 5 : 4}>
                        <TextField
                            select
                            fullWidth
                            variant='filled'
                            label='By what?'
                            value={state.priceBy}
                            onChange={(e) => dispatch({ type: ActionType.SetPriceBy, payload: e.target.value })}
                        >
                            {price_by_options.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </TextField>
                    </CenterGrid>
                </Fade>
            )}

            {state.priceBy === 'Constant' && (
                <Fade in={state.priceBy === 'Constant'} timeout={500}>
                    <CenterGrid item xs={3}>
                        <TextField
                            fullWidth
                            variant='filled'
                            label='Constant Value'
                            value={state.constantValue ?? '0'}
                            onChange={(e) => handleConstantValueChange(e.target.value)}
                            {...commonNumberFieldProps}
                        />
                    </CenterGrid>
                </Fade>
            )}

            {state.priceBy === "Per Option" && (
                <>
                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    <Fade in={state.priceBy === "Per Option"} timeout={500}>
                        <CenterGrid item xs={6}>
                            <TextField
                                select
                                fullWidth
                                label='Options'
                                variant='filled'
                                value={selectedFormOption}
                                onChange={(e) => setSelectedFormOption(e.target.value)}
                            >
                                {selected?.options.map((option: any) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </TextField>
                        </CenterGrid>
                    </Fade>

                    <Fade in={state.priceBy === "Per Option"} timeout={500}>
                        <CenterGrid item xs={6}>
                            <TextField
                                fullWidth
                                variant='filled'
                                label='Option Price'
                                disabled={!selectedFormOption}
                                value={state.perOptionMapping[selectedFormOption] ?? '0'}
                                onChange={(e) => handlePerMappingChange(selectedFormOption, e.target.value)}
                                {...commonNumberFieldProps}
                            />
                        </CenterGrid>
                    </Fade >
                </>
            )}
        </>
    );
}

export default ConfigPricingSequence;
