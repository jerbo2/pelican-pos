import React, { createContext, useState } from 'react';
import { Item } from '../Configuration';

const ItemContext = createContext<{
    itemName: string;
    storedItems: Item[];
    categoryID: number;
    setStoredItems: (storedItems: Item[]) => void;
    setCategoryID: (categoryID: number) => void;
    setItemName: (itemName: string) => void;
}>({
    itemName: '',
    storedItems: [],
    categoryID: 0,
    setItemName: () => { },
    setStoredItems: () => { },
    setCategoryID: () => { },
});


const ItemProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [itemName, setItemName] = useState<string>('');
    const [storedItems, setStoredItems] = useState<Item[]>([]);
    const [categoryID, setCategoryID] = useState<number>(0);

    return (
        <ItemContext.Provider value={{ itemName, storedItems, categoryID, setStoredItems, setCategoryID, setItemName }}>
            {children}
        </ItemContext.Provider>
    );
};

export { ItemContext, ItemProvider };