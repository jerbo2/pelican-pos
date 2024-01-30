import React, { useState, createContext } from 'react';
import { FormComponentConfig } from '../Configuration';

const FormConfigContext = createContext<{
    formConfig: FormComponentConfig[],
    selected: FormComponentConfig,
    setFormConfig: (formConfig: FormComponentConfig[]) => void,
    setSelected: (selected: FormComponentConfig) => void,
}>({
    formConfig: [],
    selected: { label: '', type: '', order: 0, options: [] },
    setFormConfig: () => { },
    setSelected: () => { },
});

const FormConfigProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [formConfig, setFormConfig] = useState<FormComponentConfig[]>([]);
    const [selected, setSelected] = useState<FormComponentConfig>({ label: '', type: '', order: 0, options: [] });

    return (
        <FormConfigContext.Provider value={{ formConfig, selected, setFormConfig, setSelected }}>
            {children}
        </FormConfigContext.Provider>
    );
};

export { FormConfigContext, FormConfigProvider };