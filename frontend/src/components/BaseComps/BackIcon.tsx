import { Hidden } from "@mui/material"
import { Button } from "../Styled"
import { ArrowBackIosNewOutlined } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

export default function BackIcon() {
    const navigate = useNavigate();
    const backPath = window.location.pathname.split('/').slice(0, -1).join('/');
    return (
        <Hidden smDown>
            <Button
                color="inherit"
                aria-label="back"
                onClick={() => navigate(backPath)}
            >
                <ArrowBackIosNewOutlined fontSize='large' />
            </Button>
        </Hidden>
    )
}