import { CenterGrid, Button } from "../Styled"
import { Toolbar, Typography, AppBar, Hidden } from "@mui/material"
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined'
import { useNavigate } from "react-router"

export default function BaseToolBar({ pageName, rightIcon }: { pageName: string, rightIcon?: React.ReactNode }) {
    const navigate = useNavigate();
    return (
        <AppBar position="static">
            <Toolbar>
                <CenterGrid item xs={2}>
                    <Hidden smDown>
                        <Button
                            color="inherit"
                            aria-label="back"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowBackIosNewOutlinedIcon fontSize='large' />
                        </Button>
                    </Hidden>
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
