import React from 'react';
import { CenterGrid, ButtonWidest } from '../Styled';
import ConfirmationButton from '../BaseComps/ConfirmationButton';
import { getTotalPrice } from './utils/orderUtils';
import { OrderItems, Order } from '../BaseComps/dbTypes';

interface ActionButtonsProps {
    deleteOrder: () => void;
    save: (newStatus: string, action?: string) => Promise<void>;
    setCheckoutOpen: (open: boolean) => void;
    setOpenDialog: (open: boolean) => void;
    orderItems: OrderItems[];
    overrideSubmit?: boolean;
    submitButtonText: string;
    activeOrder: Order;
}

const OrderActionButtons: React.FC<ActionButtonsProps> = ({ deleteOrder, save, setCheckoutOpen, setOpenDialog, orderItems, overrideSubmit, submitButtonText, activeOrder }) => {
    const cancelOrder = "Cancel this order?";
    const submitConfirmDialog = "Submit this order? ";

    return (
        <>
            {!(activeOrder.status === 'completed') && (
                <>
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={() => deleteOrder() } dialogContent={cancelOrder} disabled={activeOrder.transaction.payment_method !== null}>CANCEL</ConfirmationButton>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={() => save('submitted', 'close')} override={overrideSubmit} disabled={activeOrder.transaction.payment_method !== null} dialogContent={submitConfirmDialog + `The total is $${getTotalPrice(orderItems)}.`}>{submitButtonText}</ConfirmationButton>
                    </CenterGrid>
                </>
            )}
            {activeOrder.status === 'submitted' &&
                <>

                    <CenterGrid item xs={6}>
                        {!activeOrder.transaction.payment_method ? (
                            <ButtonWidest variant='contained' onClick={() => setCheckoutOpen(true)}>Checkout</ButtonWidest>) :
                            <ButtonWidest variant='contained' onClick={() => save('completed')}>Complete</ButtonWidest>
                        }
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ButtonWidest variant='contained' onClick={() => setOpenDialog(true)}>Print</ButtonWidest>
                    </CenterGrid>

                </>
            }
            {activeOrder.status === 'pending' && (
                <CenterGrid item xs={12}>
                    <ButtonWidest variant='contained' onClick={() => setCheckoutOpen(true)}>Orderless Checkout</ButtonWidest>
                </CenterGrid>
            )}
        </>
    );
};

export default OrderActionButtons;
