import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import PersistentDrawerLeft from './custom_MUI/PersistentDrawerLeft';
import TransitionsModal from './custom_MUI/TransitionsModal';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

interface BaseComponent {
    label: string;
}

interface SelectComponent extends BaseComponent {
    type: "select";
    options: string[];
}

interface TextComponent extends BaseComponent {
    type: "textfield";
    placeholder: string;
}

type FormComponent = SelectComponent | TextComponent;

const ConfigurationContext = createContext({
    openPopup: false,
    handleOpenPopup: () => { },
    handleClosePopup: () => { }
});


const ConfigurationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [openPopup, setOpenPopup] = useState(false);

    const handleOpenPopup = () => setOpenPopup(true);
    const handleClosePopup = () => setOpenPopup(false);

    return (
        <ConfigurationContext.Provider value={{ openPopup, handleOpenPopup, handleClosePopup }}>
            {children}
        </ConfigurationContext.Provider>
    );
};

function Configuration() {
    const [items, setItems] = useState<FormComponent[]>([]);
    const { openPopup } = useContext(ConfigurationContext);

    console.log(openPopup)

    useEffect(() => {
        axios.get('/api/v1/items/')
            .then((res) => {
                console.log(res.data);
                setItems(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
    }, []);

    return (
        <ConfigurationProvider>
            <Box sx={{ width: '100vw', height: '100vh' }}>
                <PersistentDrawerLeft
                    options={[
                        { name: 'Dropdown', icon: <AddOutlinedIcon color='primary' /> },
                        { name: 'Text Field', icon: <AddOutlinedIcon color='primary' /> },
                        { name: 'Date & Time', icon: <AddOutlinedIcon color='primary' /> },
                        { name: 'Radio Button', icon: <AddOutlinedIcon color='primary' /> },
                        { name: 'Checkbox', icon: <AddOutlinedIcon color='primary' /> },
                        { name: 'Toggle Switch', icon: <AddOutlinedIcon color='primary' /> }
                    ]}
                    children={
                        <TransitionsModal children={<div><h4>Some title</h4><p>Some other stuff</p></div>} />
                    }

                />
            </Box>
        </ConfigurationProvider>
    )
}

export { Configuration, ConfigurationContext }