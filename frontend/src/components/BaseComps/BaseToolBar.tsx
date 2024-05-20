import { CenterGrid } from "../Styled"
import { Toolbar, Typography, AppBar } from "@mui/material"
import React from "react"

export default function BaseToolBar({ pageName, leftIcon, rightIcon }: { pageName: string, leftIcon?: React.ReactNode, rightIcon?: React.ReactNode }) {
    return (
        <AppBar position="static">
            <Toolbar>
                <CenterGrid item xs={2}>
                    {leftIcon}
                </CenterGrid>
                <CenterGrid item xs={12} sm={8}>
                    <Typography variant="h3" fontWeight='bold' textAlign='center'>{pageName}</Typography>
                </CenterGrid>
                <CenterGrid item xs={2}>
                    {rightIcon}
                </CenterGrid>
            </Toolbar>
        </AppBar>
    )
}
