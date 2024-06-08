import { Box } from '@mui/material';
import ConfigDrawer from './ConfigDrawer';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ConfigFormDialog from './ConfigFormDialog';
import Snackbar from '../BaseComps/Snackbar';
import ConfigBuildList from './ConfigBuildList';
import ConfigCurrentItems from './ConfigCurrentItems';

import { UIProvider } from '../BaseComps/contexts/UIContext';
import { FormConfigProvider } from './contexts/FormConfigContext';
import { ItemProvider } from './contexts/ItemContext';
import ConfigModal from './ConfigModal';

const icon = <AddOutlinedIcon color='primary' fontSize='large' />;

function Configuration() {

    return (
        <Box sx={{ width: '100vw', height: '100vh' }}>
            <UIProvider>
                <FormConfigProvider>
                    <ItemProvider>
                            <Snackbar />
                            <ConfigFormDialog />
                            <ConfigDrawer
                                options={[
                                    { name: 'Dropdown', icon: icon },
                                    { name: 'Text Field', icon: icon },
                                    { name: 'Number Field', icon: icon },
                                    { name: 'Price', icon: icon },
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


export { Configuration };