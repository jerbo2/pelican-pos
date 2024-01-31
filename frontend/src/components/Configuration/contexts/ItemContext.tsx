import React, { createContext, useState, useEffect } from 'react';
import { Item, Category } from '../Configuration';
import axios from 'axios';

const ItemContext = createContext<{
    itemName: string;
    storedItems: Item[];
    categoryID: number;
    setStoredItems: (storedItems: Item[]) => void;
    setCategoryID: (categoryID: number) => void;
    setItemName: (itemName: string) => void;
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
        <ItemContext.Provider value={{ itemName, storedItems, categoryID, setStoredItems, setCategoryID, setItemName, getStoredItems }}>
            {children}
        </ItemContext.Provider>
    );
};

export { ItemContext, ItemProvider };