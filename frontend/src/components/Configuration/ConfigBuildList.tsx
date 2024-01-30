import React, { useContext } from "react";
import { FormConfigContext } from "./contexts/FormConfigContext";
import { UIContext } from "./contexts/UIContext";
import { Box } from '@mui/material';
import { CenterGrid, Circle, IconButton, Divider } from "../Styled";
import ConfigPreviewComponents from "./ConfigPreviewComponents";
import EditIcon from '@mui/icons-material/Edit';

export default function BuildList() {
    const { formConfig, setSelected } = useContext(FormConfigContext);
    const { setOpenPopup } = useContext(UIContext);

    const handleEdit = (id: string) => {
        const index = parseInt(id);
        setOpenPopup(true);
        setSelected({...formConfig[index], order: index});
    }

    return (
        <Box>
            <CenterGrid container>
                {formConfig.map((config, index) => {
                    return (
                        <React.Fragment key={index}>
                            <CenterGrid item xs={12}>
                                <Circle>{index + 1}</Circle>
                                <ConfigPreviewComponents configIndex={index}  />
                                <IconButton aria-label="edit" size="large" color="primary" onClick={(e)=>handleEdit(e.currentTarget.id)} id={`${index}`}>
                                    <EditIcon fontSize='inherit' />
                                </IconButton>
                            </CenterGrid>
                            <CenterGrid item key={`${index}_divider`} xs={12}><Divider /></CenterGrid>
                        </React.Fragment>
                    )
                })}
            </CenterGrid>
        </Box>
    )
}