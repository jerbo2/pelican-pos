import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';
import PersistentDrawerLeft from './custom_MUI/PersistentDrawerLeft';
import TransitionsModal from './custom_MUI/TransitionsModal';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

import { ButtonWidest, CenterGrid, TextField, Select, IconButton, Divider } from './Styled';

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

const ConfigurationContext = createContext<{
    openPopup: boolean;
    selected: FormComponent | null;
    setSelected: (selected: FormComponent | null) => void;
    handleOpenPopup: (formObjType: string) => void;
    handleClosePopup: () => void;
}>({
    openPopup: false,
    selected: null,
    setSelected: () => { },
    handleOpenPopup: () => { },
    handleClosePopup: () => { }
});


const ConfigurationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [openPopup, setOpenPopup] = useState(false);
    const [selected, setSelected] = useState<FormComponent | null>(null);

    const handleOpenPopup = (formObjType: string) => {
        setOpenPopup(true);
        if (formObjType === 'Dropdown') {
            setSelected({ label: '', type: 'select', options: [] })
        } else if (formObjType === 'Text Field') {
            setSelected({ label: '', type: 'textfield', placeholder: '' });
        }
    }
    const handleClosePopup = () => setOpenPopup(false);

    console.log(selected)

    return (
        <ConfigurationContext.Provider value={{ openPopup, selected, setSelected, handleOpenPopup, handleClosePopup }}>
            {children}
        </ConfigurationContext.Provider>
    );
};

const ModalContent = () => {
    const { selected, handleClosePopup } = useContext(ConfigurationContext);
    console.log(selected)
    switch (selected?.type) {
        case 'select':
            return (
                <CenterGrid container>
                    <CenterGrid item xs={12}>
                        <Typography variant='h2' fontWeight='bold'> Preview </Typography>
                    </CenterGrid>
                    <CenterGrid item xs={12}>
                        <Select fullWidth>
                            {selected.options.map((option) => (
                                <option value={option}>{option}</option>
                            ))}
                        </Select>
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <Divider />
                    </CenterGrid>

                    <CenterGrid item xs={12}>
                        <Typography variant='h2' fontWeight='bold'> Configuration </Typography>
                    </CenterGrid>

                    <CenterGrid item xs={6}>
                        <TextField fullWidth label='Label' variant='outlined' />
                    </CenterGrid>
                    <CenterGrid item xs={6} style={{ position: 'relative' }}>
                        <TextField fullWidth label='Option' />
                        <IconButton aria-label='add' size='large' style={{ position: 'absolute', top: 0, right: 0 }}>
                            <AddOutlinedIcon fontSize='inherit' />
                        </IconButton>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained'>Save</ButtonWidest>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={handleClosePopup}>Exit</ButtonWidest>
                    </CenterGrid>

                </CenterGrid>

            );
        case 'textfield':
            return (
                <Box>
                    <input type="text" placeholder={selected.placeholder} />
                </Box>
            );
        default:
            return <Box><span>This form object wasn't recognized. . .</span></Box>;

    }
}


function Configuration() {
    // const [items, setItems] = useState<FormComponent[]>([]);
    const { selected } = useContext(ConfigurationContext);

    console.log(selected)

    // useEffect(() => {
    //     axios.get('/api/v1/items/')
    //         .then((res) => {
    //             console.log(res.data);
    //             setItems(res.data);
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         })
    // }, []);

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
                        <TransitionsModal children={<ModalContent />} />
                    }

                />
            </Box>
        </ConfigurationProvider>
    )
}

export { Configuration, ConfigurationContext }