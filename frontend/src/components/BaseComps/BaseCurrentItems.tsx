import React from "react";
import { CardActionArea, Fade } from "@mui/material";
import { CenterGrid, Card, CardContent } from "../Styled";

export default function BaseCurrentItems({showTrigger, items, handleTapCard}: {showTrigger: boolean, items: any[], handleTapCard: (str_id: string) => void}) {
    
    return (
        !showTrigger && (
            <React.Fragment>
                <CenterGrid container>
                    {items.map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                <CenterGrid item xs={6} sm={3} sx={{ textAlign: 'center' }}>
                                    <CardActionArea sx={{ m: 16 }}>
                                        <Fade in={!showTrigger}>
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