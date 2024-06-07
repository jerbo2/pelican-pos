import React, { useState, createContext, Dispatch, SetStateAction } from 'react';
import { AdditionalOrderInfo, OrderItems } from '../../BaseComps/dbTypes';
import dayjs from 'dayjs';

const OriginalOrderInfoContext = createContext<{
    originalOrderItems: OrderItems[]
    setOriginalOrderItems: Dispatch<SetStateAction<OrderItems[]>>
    originalAdditionalOrderInfo: AdditionalOrderInfo
    setOriginalAdditionalOrderInfo: Dispatch<SetStateAction<AdditionalOrderInfo>>
}>({
    originalOrderItems: [],
    setOriginalOrderItems: () => { },
    originalAdditionalOrderInfo: {},
    setOriginalAdditionalOrderInfo: () => { },

});

const OriginalOrderInfoProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [originalOrderItems, setOriginalOrderItems] = useState<OrderItems[]>([]);
    const [originalAdditionalOrderInfo, setOriginalAdditionalOrderInfo] = useState<AdditionalOrderInfo>({ 'customer_name': '', 'customer_phone_number': '', 'complete_at': dayjs() });

    return (
        <OriginalOrderInfoContext.Provider value={{ 
            originalOrderItems,
            setOriginalOrderItems,
            originalAdditionalOrderInfo,
            setOriginalAdditionalOrderInfo }}>
            {children}
        </OriginalOrderInfoContext.Provider>
    );
};

export { OriginalOrderInfoContext, OriginalOrderInfoProvider };