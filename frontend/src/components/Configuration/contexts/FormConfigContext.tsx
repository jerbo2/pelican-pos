import React, { useState, createContext, Dispatch, SetStateAction } from 'react';
import { FormComponentConfig } from '../../BaseComps/dbTypes';

const defaultFormConfig: FormComponentConfig[] = [];

const defaultSelected: FormComponentConfig = {
    label: '',
    type: '',
    order: 0,
    options: [],
    pricing_config: {
        affectsPrice: false,
        dependsOn: {
            name: '',
            values: {}
        }
    }
};

const FormConfigContext = createContext<{
    formConfig: FormComponentConfig[],
    selected: FormComponentConfig,
    setFormConfig: Dispatch<SetStateAction<FormComponentConfig[]>>,
    setSelected: Dispatch<SetStateAction<FormComponentConfig>>
}>({
    formConfig: defaultFormConfig,
    selected: defaultSelected,
    setFormConfig: () => [],
    setSelected: () => { },
});

const FormConfigProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [formConfig, setFormConfig] = useState<FormComponentConfig[]>(defaultFormConfig);
    const [selected, setSelected] = useState<FormComponentConfig>(defaultSelected);

    return (
        <FormConfigContext.Provider value={{ formConfig, selected, setFormConfig, setSelected }}>
            {children}
        </FormConfigContext.Provider>
    );
};

export { FormConfigContext, FormConfigProvider };