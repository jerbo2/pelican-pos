
import { useState } from "react";
import { TextField, MenuItem } from "../Styled"
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { FormComponentConfig } from "../Configuration/Configuration";

export default function BasePreviewComponents({ component }: { component: FormComponentConfig }) {
    const [previewSelected, setPreviewSelected] = useState<string[]>([]);

    const handlePreviewSelectedChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedPreviewSelected = [...previewSelected];
        updatedPreviewSelected[index] = e.target.value;
        setPreviewSelected(updatedPreviewSelected);
    }

    const commonProps = {
        label: component.label,
        fullWidth: true,
        value: previewSelected[component.order] || '',
        onChange: handlePreviewSelectedChange(component.order),
    };

    console.log(previewSelected)

    switch (component.type) {
        case 'text':
            return (
                <TextField variant="filled" {...commonProps} />
            )
        case 'single_select':
            return (
                <TextField select variant='filled' {...commonProps}>
                    {component.options.map((option) => (
                        <MenuItem key={`preview_${option}`} value={option}>{option}</MenuItem>
                    ))}
                </TextField>
            )
        case 'datetime':
            return (
                <DateTimePicker/>
            )
        default:
            return ('Oops. . .')
    }
}