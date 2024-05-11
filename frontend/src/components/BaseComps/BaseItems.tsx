import { CenterGrid, ButtonWider } from "../Styled"
import { useNavigate } from "react-router"
import { Box } from "@mui/material"
import BaseToolBar from "./BaseToolBar"
import { useEffect, useState } from "react";
import axios from 'axios';
import { Category } from "./dbTypes";

interface BaseItems {
    pageRoot: string;
    pageName: string;
    rightIcon?: React.ReactNode;
}

export default function BaseItems({ pageRoot, pageName, rightIcon }: BaseItems) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    const handleRedirect = (category: string) => {
        navigate(`/${pageRoot}/${category}`)
    }

    useEffect(() => {
        const get_categories = async () => {
            const response = await axios.get('/api/v1/categories?include_items=False');
            setCategories(response.data)
        }
        get_categories()
    }, []);

    const toolbarHeight = '64px';

    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <CenterGrid container>
                <CenterGrid item xs={12}>
                    <BaseToolBar pageName={pageName} rightIcon={rightIcon} />
                </CenterGrid>

                <CenterGrid container alignItems="center" justifyContent="center" sx={{ height: `calc(100vh - ${toolbarHeight})` }}>

                    {categories.map((category: Category) => {
                        return (
                            <CenterGrid item xs={12} key={category.id}>
                                <ButtonWider variant="contained" fullWidth onClick={() => handleRedirect(category.name)}>
                                    {category.proper_name}
                                </ButtonWider>
                            </CenterGrid>
                        )
                    })}

                </CenterGrid>
            </CenterGrid>
        </Box>
    )
}