import axios from 'axios';
import { Box } from '@mui/material';
import { WEBSOCKET_URL } from '../Constants';
import ConfigDrawer from './ConfigDrawer';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ConfigFormDialog from './ConfigFormDialog';
import ConfigSnackbar from './ConfigSnackbar';
import ConfigBuildList from './ConfigBuildList';
import ConfigCurrentItems from './ConfigCurrentItems';

import { UIProvider } from './contexts/UIContext';
import { FormConfigProvider } from './contexts/FormConfigContext';
import { ItemProvider } from './contexts/ItemContext';
import { WebSocketProvider } from '../BaseComps/contexts/WebSocketContext';
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


function Configuration() {
    const icon = <AddOutlinedIcon color='primary' fontSize='large' />;

    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <UIProvider>
                <FormConfigProvider>
                    <ItemProvider>
                        <WebSocketProvider url={WEBSOCKET_URL}>
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
                        </WebSocketProvider>
                    </ItemProvider>
                </FormConfigProvider>
            </UIProvider>
        </Box >
    )
}


export { Configuration };
export type { FormComponentConfig, Item, Category };