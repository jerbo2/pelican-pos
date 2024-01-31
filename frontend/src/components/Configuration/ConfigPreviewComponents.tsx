
import { useContext, useState } from "react";
import { TextField, MenuItem } from "../Styled"
import { FormConfigContext } from "./contexts/FormConfigContext";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function ConfigPreviewComponents({ configIndex, type }: { configIndex: number, type: string }) {
    const { formConfig } = useContext(FormConfigContext);
    const [previewSelected, setPreviewSelected] = useState<string[]>([]);

    const handlePreviewSelectedChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedPreviewSelected = [...previewSelected];
        updatedPreviewSelected[index] = e.target.value;
        setPreviewSelected(updatedPreviewSelected);
    }

    const commonProps = {
        label: formConfig[configIndex]?.label,
        fullWidth: true,
        value: previewSelected[configIndex] || '',
        onChange: handlePreviewSelectedChange(configIndex),
    };

    console.log(previewSelected)

    switch (type) {
        case 'text':
            return (
                <TextField variant="filled" {...commonProps} />
            )
        case 'single_select':
            return (
                <TextField select variant='filled' {...commonProps}>
                    {formConfig[configIndex]?.options.map((option) => (
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