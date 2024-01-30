import React, { useContext } from "react";
import { CardActionArea, Fade } from "@mui/material";
import { CenterGrid, Card, CardContent } from "../Styled";
import { UIContext } from "./contexts/UIContext";
import { ItemContext } from "./contexts/ItemContext";
import { FormConfigContext } from "./contexts/FormConfigContext";

export default function ConfigCurrentItems() {
    const { storedItems, setItemName } = useContext(ItemContext);
    const { openDrawer, handleOpenDrawer } = useContext(UIContext);
    const { setFormConfig } = useContext(FormConfigContext);

    const handleTapCard = (str_id: string) => {
        const id = parseInt(str_id);
        console.log(id)
        handleOpenDrawer(false);
        setItemName(storedItems[id].name);
        setFormConfig(storedItems[id].form_cfg);
    }
    
    return (
        !openDrawer && (
            <React.Fragment>
                <CenterGrid container>
                    {storedItems.map((item, index) => {
                        return (

                            <React.Fragment key={index}>
                                <CenterGrid item xs={3} sx={{ textAlign: 'center' }}>
                                    <CardActionArea sx={{ m: 16 }}>
                                        <Fade in={!openDrawer}>
                                            <Card variant="outlined" id={`${index}`} onClick={(e) => handleTapCard(e.currentTarget.id)}>
                                                <CardContent>
                                                    {item.name}
                                                </CardContent>
                                            </Card>
                                        </Fade>
                                    </CardActionArea>
                                </CenterGrid>
                            </React.Fragment>

                        )
                    })}
                </CenterGrid>
            </React.Fragment>
        )
    )
}