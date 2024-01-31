import { CenterGrid, ButtonWider, Button } from "../Styled"
import { Toolbar, Typography, AppBar, Hidden } from "@mui/material"
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined'
import { useNavigate } from "react-router"
import { Box } from "@mui/material"

export default function BaseItems({ pageRoot, pageName }: { pageRoot: string, pageName: string }) {
    const navigate = useNavigate();

    const handleRedirect = (category: string) => {
        navigate(`/${pageRoot}/${category}`)
    }

    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <CenterGrid container spacing={1} alignItems="center" justifyContent="center" style={{ height: '100%' }}>
                <CenterGrid item xs={12}>
                    <AppBar>
                        <Toolbar>
                            <CenterGrid item xs={4}>
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
                            <CenterGrid item xs={4}>
                                <Typography variant="h3" fontWeight='bold'>{pageName}</Typography>
                            </CenterGrid>
                            <CenterGrid item xs={4} />
                        </Toolbar>
                    </AppBar>
                </CenterGrid>

                <CenterGrid item xs={12} onClick={() => handleRedirect('steamed')}>
                    <ButtonWider variant="contained" fullWidth>
                        Steamed Items
                    </ButtonWider>
                </CenterGrid>

                <CenterGrid item xs={12} onClick={() => handleRedirect('menu')}>
                    <ButtonWider variant="contained" fullWidth>
                        Menu Items
                    </ButtonWider>
                </CenterGrid>

                <CenterGrid item xs={12} onClick={() => handleRedirect('case')}>
                    <ButtonWider variant="contained" fullWidth>
                        Case Items
                    </ButtonWider>
                </CenterGrid>

                <CenterGrid item xs={12} sm={6} onClick={() => handleRedirect('drinks')}>
                    <ButtonWider variant="contained" fullWidth>
                        Drinks
                    </ButtonWider>
                </CenterGrid>

                <CenterGrid item xs={12} sm={6} onClick={() => handleRedirect('misc')}>
                    <ButtonWider variant="contained" fullWidth>
                        Misc
                    </ButtonWider>
                </CenterGrid>

            </CenterGrid>
        </Box>
    )
}