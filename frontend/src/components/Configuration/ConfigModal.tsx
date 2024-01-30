import { useContext, useEffect } from "react";
import axios from "axios";
import TransitionsModal from "../custom_MUI/TransitionsModal";
import ConfigModalContent from "./ConfigModalContent";
import { UIContext } from "./contexts/UIContext";
import { ItemContext } from "./contexts/ItemContext";
import { Category } from "./Configuration";

export default function ConfigModal() {
    const { openPopup, setOpenPopup } = useContext(UIContext);
    const { setStoredItems, setCategoryID } = useContext(ItemContext);

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

    const handleClosePopup = () => {
        getStoredItems();
        setOpenPopup(false);
    };

    return (
        <TransitionsModal children={<ConfigModalContent handleClosePopup={handleClosePopup} />} openPopup={openPopup} handleClosePopup={handleClosePopup}/>
    )
}