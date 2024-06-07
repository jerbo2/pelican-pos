import { CenterGrid, ButtonWider, ButtonWidest } from "../Styled"
import { useNavigate } from "react-router"
import { List, Hidden, Button, Divider, ListItem } from "@mui/material"
import BaseToolBar from "./BaseToolBar"
import { useEffect, useState } from "react";
import axios from 'axios';
import { Category } from "./dbTypes";
import TemporaryDrawer from "./TemporaryDrawer";
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import Box from '@mui/material/Box';

interface BaseItems {
    pageRoot: string;
    pageName: string;
    rightIcon?: React.ReactNode;
    renderItems?: boolean;
}


export default function BaseNav({ pageRoot, pageName, rightIcon, renderItems = true }: BaseItems) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [openDrawer, setOpenDrawer] = useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpenDrawer(newOpen);
    };

    const handleRedirect = (category: string) => {
        navigate(`/${pageRoot}/${category}`)
    }

    useEffect(() => {
        if (!renderItems) return;
        const get_categories = async () => {
            const response = await axios.get('/api/v1/categories?include_items=False');
            setCategories(response.data)
        }
        get_categories()
    }, []);

    const DrawerList = (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <List>
                <ListItem>
                    <ButtonWidest variant="contained" onClick={() => navigate('/')}>Home</ButtonWidest>
                </ListItem>
                <Divider />
                <ListItem>
                    <ButtonWidest variant="contained" onClick={() => navigate('/active-orders')}>Active</ButtonWidest>
                </ListItem>
                <ListItem>
                    <ButtonWidest variant="contained" onClick={() => navigate('/order')}>New</ButtonWidest>
                </ListItem>
                <ListItem>
                    <ButtonWidest variant="contained" onClick={() => navigate('/past-orders')}>Past</ButtonWidest>
                </ListItem>
                <Divider />
                <ListItem>
                    <ButtonWidest variant="contained" onClick={() => navigate('/config')}>Config</ButtonWidest>
                </ListItem>
                <Divider />
            </List>
        </Box>
    )

    const toolbarHeight = '64px';

    const leftIcon = (
        <Hidden smDown>
            <Button
                color="inherit"
                aria-label="toggleDrawer"
                onClick={toggleDrawer(true)}
            >
                <MenuOutlinedIcon fontSize='large' />
            </Button>
        </Hidden>
    )

    return (
        <Box sx={{ width: '100vw', height: renderItems ? '100vh' : toolbarHeight }}>
            <TemporaryDrawer drawerList={DrawerList} openDrawer={openDrawer} toggleDrawer={toggleDrawer} />
            <CenterGrid container>
                <CenterGrid item xs={12}>
                    <BaseToolBar pageName={pageName} leftIcon={leftIcon} rightIcon={rightIcon} />
                </CenterGrid>
                {renderItems && (
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
                )}
            </CenterGrid>
        </Box>
    )
}