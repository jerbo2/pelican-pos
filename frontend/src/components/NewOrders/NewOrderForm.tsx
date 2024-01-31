import React, { useContext } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { Box } from '@mui/material';
import { CenterGrid, Circle, Divider } from "../Styled";
import ConfigPreviewComponents from "../Configuration/ConfigPreviewComponents";

export default function NewOrderForm() {
    const { formConfig } = useContext(FormConfigContext);

    return (
        <Box>
            <CenterGrid container>
                {formConfig.map((config, index) => {
                    return (
                        <React.Fragment key={index}>
                            <CenterGrid item xs={12}>
                                <Circle>{index + 1}</Circle>
                                <ConfigPreviewComponents configIndex={index}  />
                            </CenterGrid>
                            <CenterGrid item key={`${index}_divider`} xs={12}><Divider /></CenterGrid>
                        </React.Fragment>
                    )
                })}
            </CenterGrid>
        </Box>
    )
}