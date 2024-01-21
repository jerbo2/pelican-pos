
import { useContext, useState } from "react";
import { TextField, MenuItem } from "../Styled"
import { ConfigurationContext } from "./Configuration";

export default function ConfigPreviewComponents({configIndex}: {configIndex: number}) {
    const { formConfig } = useContext(ConfigurationContext);
    const [previewSelected, setPreviewSelected] = useState<string[]>(['']);

    const handlePreviewSelectedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedPreviewSelected = [...previewSelected];
        updatedPreviewSelected[configIndex] = e.target.value;
        setPreviewSelected(updatedPreviewSelected);
    }

    return (
        <TextField
            select
            label={formConfig[configIndex]?.label}
            fullWidth
            variant='filled'
            value={previewSelected[configIndex] || ''}
            onChange={handlePreviewSelectedChange}
        >
            {formConfig[configIndex]?.options.map((option) => (
                <MenuItem key={`preview_${option}`} value={option}>{option}</MenuItem>
            ))}
        </TextField>
    )
}