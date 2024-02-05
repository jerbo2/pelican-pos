import { CenterGrid, ButtonWider } from "../Styled"
import { useNavigate } from "react-router"
import { Box } from "@mui/material"
import BaseToolBar from "./BaseToolBar"

export default function BaseItems({ pageRoot, pageName }: { pageRoot: string, pageName: string }) {
    const navigate = useNavigate();

    const handleRedirect = (category: string) => {
        navigate(`/${pageRoot}/${category}`)
    }

    const toolbarHeight = '64px';

    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <CenterGrid container>
                <CenterGrid item xs={12}>
                    <BaseToolBar pageName={pageName} />
                </CenterGrid>

                <CenterGrid container alignItems="center" justifyContent="center" sx={{ height: `calc(100vh - ${toolbarHeight})`}}>

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
            </CenterGrid>
        </Box>
    )
}