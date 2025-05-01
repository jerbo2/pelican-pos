import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Item, CategoryWithItems, InventoryConfig } from '../../BaseComps/dbTypes';
import { useNavigate } from 'react-router';
import axios from 'axios';

const defaultInventoryConfig: InventoryConfig = {
    manageItemInventory: false,
    dependsOn: { name: 'none', amounts: {} },
    decrementDependsOn: { names: [], amounts: {} },
    decrementer: '1_per_order'
};

const ItemContext = createContext<{
    itemName: string;
    storedItems: Item[];
    categoryID: number;
    taxRate: number;
    inventory: InventoryConfig;
    setStoredItems: Dispatch<SetStateAction<Item[]>>;
    setCategoryID: Dispatch<SetStateAction<number>>;
    setItemName: Dispatch<SetStateAction<string>>;
    getStoredItems: () => void;
    setTaxRate: Dispatch<SetStateAction<number>>;
    setInventory: Dispatch<SetStateAction<InventoryConfig>>;
}>({
    itemName: '',
    storedItems: [],
    categoryID: 0,
    taxRate: 0,
    inventory: defaultInventoryConfig,
    setItemName: () => { },
    setStoredItems: () => { },
    setCategoryID: () => { },
    getStoredItems: () => { },
    setTaxRate: () => { },
    setInventory: () => { }
});


const ItemProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [itemName, setItemName] = useState<string>('');
    const [storedItems, setStoredItems] = useState<Item[]>([]);
    const [categoryID, setCategoryID] = useState<number>(0);
    const [taxRate, setTaxRate] = useState<number>(6.625);
    const [inventory, setInventory] = useState<InventoryConfig>(defaultInventoryConfig);

    const URL = window.location.pathname;
    const categoryName = URL.split('/').pop();
    const navigate = useNavigate();

    const getStoredItems = async () => {
        try {
            const res = await axios.get('/api/v1/categories?include_items=True');
            const match = res.data.find((category: CategoryWithItems) => category.name.toLowerCase() === categoryName?.toLowerCase());
            if (match) {
                setStoredItems(match.items);
                setCategoryID(match.id);
                console.log(`Category found: ${categoryName}`);
                console.log('match: ', match);
            }
            else {
                console.error(`Category not found: ${categoryName}`);
                // remove bad category from URL
                navigate(URL.replace(categoryName || '', ''));
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getStoredItems();
    }, []);

    return (
        <ItemContext.Provider value={{ itemName, storedItems, categoryID, taxRate, inventory, setStoredItems, setCategoryID, setItemName, getStoredItems, setTaxRate, setInventory }}>
            {children}
        </ItemContext.Provider>
    );
};

export { ItemContext, ItemProvider, defaultInventoryConfig };