import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { Box, List, ListItem, Menu, MenuItem } from '@mui/material';
import ConfigDrawer from './ConfigDrawer';
import TransitionsModal from '../custom_MUI/TransitionsModal';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ConfigFormDialog from './ConfigFormDialog';
import ConfigSnackbar from './ConfigSnackbar';
import ConfigModalContent from './ConfigModalContent';
import { Add, Build } from '@mui/icons-material';
import BuildList from './ConfigBuildList';
import ConfigCurrentItems from './ConfigCurrentItems';


type FormComponentConfig = {
    label: string;
    type: string;
    order: number;
    options: string[];
}

type Item = {
    name: string;
    form_cfg: FormComponentConfig[];
    category_id: number;
    id: number;
}

type Category = {
    name: string;
    id: number;
    items: Item[];

}

const ConfigurationContext = createContext<{
    openPopup: boolean;
    openDrawer: boolean;
    openDialog: boolean;
    openSnackbar: boolean;
    formConfig: FormComponentConfig[];
    selected: FormComponentConfig;
    itemName: string;
    snackbarMessage: string;
    storedItems: Item[];
    categoryID: number;
    setFormConfig: (formConfig: FormComponentConfig[]) => void;
    setSelected: (selected: FormComponentConfig) => void;
    setOpenSnackbar: (openSnackbar: boolean) => void;
    setSnackbarMessage: (snackbarMessage: string) => void;
    setStoredItems: (storedItems: Item[]) => void;
    setCategoryID: (categoryID: number) => void;
    setOpenPopup: (openPopup: boolean) => void;
    setItemName: (itemName: string) => void;
    handleOpenPopup: (formObjType: string) => void;
    handleClosePopup: () => void;
    handleOpenDrawer: (create: boolean) => void;
    handleCloseDrawer: () => void;
    handleCloseDialog: () => void;
    handleSetItemName: (name: string) => void;
}>({
    openPopup: false,
    openDrawer: false,
    openDialog: false,
    openSnackbar: false,
    formConfig: [],
    selected: { label: '', type: '', order: 0, options: [] },
    itemName: '',
    snackbarMessage: '',
    storedItems: [],
    categoryID: 0,
    setFormConfig: () => { },
    setSelected: () => { },
    setOpenSnackbar: () => { },
    setSnackbarMessage: () => { },
    setStoredItems: () => { },
    setCategoryID: () => { },
    setOpenPopup: () => { },
    setItemName: () => { },
    handleOpenPopup: () => { },
    handleClosePopup: () => { },
    handleOpenDrawer: () => { },
    handleCloseDrawer: () => { },
    handleCloseDialog: () => { },
    handleSetItemName: () => { },
});

async function handleSave(itemName: string, formConfig: FormComponentConfig[], category: number, storedItems: Item[], setSnackbarMessage: (snackbarMessage: string) => void, setOpenSnackbar: (openSnackbar: boolean) => void) {
    console.log(storedItems);

    const itemExists = storedItems.some(item => item.name === itemName);
    const itemID = storedItems.filter(item => item.name === itemName)[0]?.id;
    const url = itemExists ? `/api/v1/items/update/${itemID}/` : '/api/v1/items/create/';
    const axiosMethod = itemExists ? axios.put : axios.post;

    const payload = {
        "name": itemName,
        "form_cfg": formConfig,
        "category_id": category,
        "id": itemID
    };

    console.log(payload);

    try {
        const res = await axiosMethod(url, payload);
        console.log(res.data);
        setSnackbarMessage(`${itemName} ${itemExists ? 'Updated' : 'Saved'}!`);
        setOpenSnackbar(true);
    } catch (err) {
        console.log(err);
        setSnackbarMessage(`Error ${itemExists ? 'Updating' : 'Saving'} Item`);
        setOpenSnackbar(true);
    }
}


const ConfigurationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [openPopup, setOpenPopup] = useState(false);
    const [formConfig, setFormConfig] = useState<FormComponentConfig[]>([]);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [itemName, setItemName] = useState<string>('');
    const [selected, setSelected] = useState<FormComponentConfig>({ label: '', type: '', order: 0, options: [] });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [storedItems, setStoredItems] = useState<Item[]>([]);
    const [categoryID, setCategoryID] = useState<number>(0);

    const handleOpenPopup = (formObjType: string) => {
        setOpenPopup(true);
        const newFormObject = { label: '', type: '', order: formConfig.length, options: [] };
        switch (formObjType) {
            case 'Dropdown':
                newFormObject.label = '';
                newFormObject.type = 'single_select';
                break;
            case 'Text Field':
                newFormObject.label = '';
                newFormObject.type = 'text';
                break;
            case 'Date & Time':
                newFormObject.label = '';
                newFormObject.type = 'datetime';
                break;
            default:
                newFormObject.label = '';
                newFormObject.type = 'error';
                break;
        }

        setFormConfig([...formConfig, newFormObject]);
        setSelected(newFormObject);
    }
    
    const handleClosePopup = () => {
        getStoredItems();
        setOpenPopup(false);
    };

    const handleOpenDrawer = (create: boolean) => {
        if (create) {
            setOpenDialog(true);
        }
        else {
            setOpenDrawer(true);
        }
    };

    useEffect(() => {
        console.log(itemName)
        if (!openDialog && itemName !== '') {
            setOpenDrawer(true);
        }
    }, [openDialog]);

    const handleCloseDrawer = () => {
        setOpenDrawer(false);
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSetItemName = (name: string) => {
        let itemExists = false;
        storedItems.forEach((item) => {
            if (item.name.toLowerCase() === name.toLowerCase()) {
                setSnackbarMessage('This item already exists. . .');
                setOpenSnackbar(true);
                itemExists = true;
            }
        });

        if (!itemExists) {
            setItemName(name);
            handleCloseDialog();
        }
    }

    const categoryName = window.location.pathname.split('/').pop();

    const getStoredItems = () => {
        axios.get('/api/v1/categories/')
            .then((res) => {
                res.data.forEach((category: Category) => {
                    if (category.name.toLowerCase() === categoryName?.toLowerCase()) {
                        setStoredItems(category.items);
                        setCategoryID(category.id);
                    }
                })
            })
            .catch((err) => {
                console.log(err);
            })
    }

    useEffect(() => {
        getStoredItems();
    }, []);

    return (
        <ConfigurationContext.Provider value={{ openPopup, openDrawer, openDialog, openSnackbar, itemName, formConfig, selected, snackbarMessage, storedItems, categoryID, setFormConfig, setSelected, setOpenSnackbar, setSnackbarMessage, setStoredItems, setCategoryID, setOpenPopup, setItemName, handleOpenPopup, handleClosePopup, handleOpenDrawer, handleCloseDrawer, handleCloseDialog, handleSetItemName }}>
            {children}
        </ConfigurationContext.Provider>
    );
};

function Configuration() {
    const icon = <AddOutlinedIcon color='primary' fontSize='large' />;
    return (
        <ConfigurationProvider>
            <Box sx={{ width: '100vw', height: '100vh' }}>
                <ConfigSnackbar />
                <ConfigFormDialog />
                <ConfigDrawer
                    options={[
                        { name: 'Dropdown', icon: icon },
                        { name: 'Text Field', icon: icon },
                        { name: 'Date & Time', icon: icon },
                    ]}
                    children={
                        <>
                            <TransitionsModal children={<ConfigModalContent />} />
                            <BuildList />
                            <ConfigCurrentItems />
                        </>
                    }
                />
            </Box>
        </ConfigurationProvider>
    )
}


export { Configuration, ConfigurationContext, handleSave };
export type { FormComponentConfig, Item };