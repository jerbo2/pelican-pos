import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Item, CategoryWithItems } from '../../BaseComps/dbTypes';
import axios from 'axios';

const ItemContext = createContext<{
    itemName: string;
    storedItems: Item[];
    categoryID: number;
    setStoredItems: Dispatch<SetStateAction<Item[]>>;
    setCategoryID: Dispatch<SetStateAction<number>>;
    setItemName: Dispatch<SetStateAction<string>>;
    getStoredItems: () => void;
}>({
    itemName: '',
    storedItems: [],
    categoryID: 0,
    setItemName: () => { },
    setStoredItems: () => { },
    setCategoryID: () => { },
    getStoredItems: () => { },
});


const ItemProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [itemName, setItemName] = useState<string>('');
    const [storedItems, setStoredItems] = useState<Item[]>([]);
    const [categoryID, setCategoryID] = useState<number>(0);

    const categoryName = window.location.pathname.split('/').pop();

    const getStoredItems = () => {
        axios.get('/api/v1/categories?include_items=True')
            .then((res) => {
                res.data.forEach((category: CategoryWithItems) => {
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
        <ItemContext.Provider value={{ itemName, storedItems, categoryID, setStoredItems, setCategoryID, setItemName, getStoredItems }}>
            {children}
        </ItemContext.Provider>
    );
};

export { ItemContext, ItemProvider };