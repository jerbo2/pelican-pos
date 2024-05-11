
import { useState } from "react";
import { TextField, MenuItem } from "../Styled"
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { FormComponentConfig } from "./dbTypes";

interface BasePreviewComponentsProps {
    component: FormComponentConfig;
    handleOnValueChange?: (index: number, value: string) => void;
    index?: number;
}

export default function BasePreviewComponents({ component, handleOnValueChange, index }: BasePreviewComponentsProps) {
    const [previewSelected, setPreviewSelected] = useState<string[]>([]);

    const handlePreviewSelectedChange = () => (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedPreviewSelected = [...previewSelected];
        updatedPreviewSelected[component.order] = e.target.value;
        setPreviewSelected(updatedPreviewSelected);
        // index and handleOnValueChange are optional depending on if the parent component needs to know the value
        handleOnValueChange?.(index ?? -1, e.target.value);
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
                    {component.options.map((option) => (
                        <MenuItem key={`preview_${option}`} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
            );
        case 'datetime':
            return (
                <DateTimePicker sx={{width: '100%'}} minutesStep={5}/>
            )
        default:
            return ('Oops. . .');
    }
};