import axios from 'axios';
import { Box } from '@mui/material';
import ConfigDrawer from './ConfigDrawer';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ConfigFormDialog from './ConfigFormDialog';
import ConfigSnackbar from './ConfigSnackbar';
import ConfigBuildList from './ConfigBuildList';
import ConfigCurrentItems from './ConfigCurrentItems';

import { UIProvider } from './contexts/UIContext';
import { FormConfigProvider } from './contexts/FormConfigContext';
import { ItemProvider } from './contexts/ItemContext';
import ConfigModal from './ConfigModal';


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

function Configuration() {
    const icon = <AddOutlinedIcon color='primary' fontSize='large' />;

    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <UIProvider>
                <FormConfigProvider>
                    <ItemProvider>
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
                                    <ConfigModal />
                                    <ConfigBuildList />
                                    <ConfigCurrentItems />
                                </>
                            }
                        />
                    </ItemProvider>
                </FormConfigProvider>
            </UIProvider>
        </Box >
    )
}


export { Configuration, handleSave };
export type { FormComponentConfig, Item, Category };