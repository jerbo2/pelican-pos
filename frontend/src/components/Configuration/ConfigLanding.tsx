import { CenterGrid, Button } from "../Styled"
import { useNavigate } from "react-router"
import { Box } from "@mui/material"

export default function ConfigLanding() {
    const navigate = useNavigate();
    const handleRedirect = (category: string) => {
        navigate(`/config/${category}`)
    }
    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <CenterGrid container spacing={2} alignItems="center" justifyContent="center" style={{ height: '100%' }}>

                <CenterGrid item xs={12} onClick={()=>handleRedirect('steamed')}>
                    <Button variant="contained" fullWidth>
                        Steamed Items
                    </Button>
                </CenterGrid>

                <CenterGrid item xs={12} onClick={()=>handleRedirect('menu')}>
                    <Button variant="contained" fullWidth>
                        Menu Items
                    </Button>
                </CenterGrid>

                <CenterGrid item xs={12} onClick={()=>handleRedirect('case')}>
                    <Button variant="contained" fullWidth>
                        Case Items
                    </Button>
                </CenterGrid>

                <CenterGrid item xs={6} onClick={()=>handleRedirect('drinks')}>
                    <Button variant="contained" fullWidth>
                        Drinks
                    </Button>
                </CenterGrid>

                <CenterGrid item xs={6} onClick={()=>handleRedirect('misc')}>
                    <Button variant="contained" fullWidth>
                        Misc
                    </Button>
                </CenterGrid>

            </CenterGrid>
        </Box>

    )
}
