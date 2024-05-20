
import { useState, useEffect } from "react";
import { TextField, MenuItem } from "../Styled"
import { FormComponentConfig, FormValue } from "./dbTypes";

interface BasePreviewComponentProps {
    component: FormComponentConfig;
    formValues?: FormValue[];
    setFormValues?: React.Dispatch<React.SetStateAction<FormValue[]>>;
    index?: number;
    initialValue?: string;
}

export default function BasePreviewComponent({ component, formValues, setFormValues, index, initialValue }: BasePreviewComponentProps) {
    const [previewSelected, setPreviewSelected] = useState<string[]>([]);

    useEffect(() => {
        if (initialValue) {
            console.log(initialValue)
            const updatedPreviewSelected = [...previewSelected];
            updatedPreviewSelected[component.order] = initialValue;
            setPreviewSelected(updatedPreviewSelected);
        }
    }, [initialValue]);

    const handlePreviewSelectedChange = () => (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedPreviewSelected = [...previewSelected];
        updatedPreviewSelected[component.order] = e.target.value;
        setPreviewSelected(updatedPreviewSelected);
        // index and handleOnValueChange are optional depending on if the parent component needs to know the value
        //handleOnValueChange?.(index ?? -1, e.target.value);
        if (formValues && setFormValues) {
            const updatedFormValues = [...formValues];
            updatedFormValues[index ?? -1].value = e.target.value;
            setFormValues(updatedFormValues);
        }
    }


    const commonProps = {
        label: component.label,
        fullWidth: true,
        value: previewSelected[component.order] || '',
        onChange: handlePreviewSelectedChange()
    };

    switch (component.type) {
        case 'text':
            return <TextField variant="filled" {...commonProps} />;
        case 'single_select':
            return (
                <TextField select variant='filled' {...commonProps}>
                    <MenuItem value=''>—</MenuItem>
                    {component.options.map((option) => (
                        <MenuItem key={`preview_${option}`} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
            );
        case 'number':
            return <TextField type='number' variant='filled' {...commonProps} inputProps={{min: '0', step: '0.5'}}/>;
        default:
            return ('Oops. . .');
    }
};