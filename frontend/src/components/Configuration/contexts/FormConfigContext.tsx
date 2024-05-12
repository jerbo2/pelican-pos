import React, { useState, createContext, Dispatch, SetStateAction } from 'react';
import { FormComponentConfig } from '../../BaseComps/dbTypes';

const FormConfigContext = createContext<{
    formConfig: FormComponentConfig[],
    selected: FormComponentConfig,
    setFormConfig: Dispatch<SetStateAction<FormComponentConfig[]>>,
    setSelected: Dispatch<SetStateAction<FormComponentConfig>>
}>({
    formConfig: [],
    selected: { label: '', type: '', order: 0, options: [], pricing_config: {affectsPrice: false} },
    setFormConfig: () => [],
    setSelected: () => { },
});

const FormConfigProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [formConfig, setFormConfig] = useState<FormComponentConfig[]>([]);
    const [selected, setSelected] = useState<FormComponentConfig>({ label: '', type: '', order: 0, options: [], pricing_config: {affectsPrice: false} });

    return (
        <FormConfigContext.Provider value={{ formConfig, selected, setFormConfig, setSelected }}>
            {children}
        </FormConfigContext.Provider>
    );
};

export { FormConfigContext, FormConfigProvider };