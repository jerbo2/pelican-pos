import { useRef, useContext, useReducer } from 'react';
import { CenterGrid, Divider, MenuItemSmaller, TextFieldSmaller } from '../Styled';
import { Typography, InputAdornment, Fade } from '@mui/material';
import CloseButton from '../BaseComps/CloseButton';
import TransitionsModal from '../BaseComps/TransitionsModal';
import { max } from 'lodash';
import ConfirmationButton from '../BaseComps/ConfirmationButton';
import { UIContext } from '../BaseComps/contexts/UIContext';
import { OrderContext } from './contexts/OrderContext';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { AdditionalOrderInfo, Order } from '../BaseComps/dbTypes';
import { handleOpenCashDrawer } from '../Landing';
import { WebSocketContext } from '../BaseComps/contexts/WebSocketContext';

interface PricingTotals {
    total_non_taxable: number;
    total_taxable: number;
    collected_tax: number;
    total_amount: number;
}
interface CheckoutProps {
    open: boolean;
    onClose: () => void;
    pricingTotals: PricingTotals
}

interface PaymentState {
    method: 'Card' | 'Cash' | 'Card → Cash' | 'Cash → Card';
    cashPaid: string;
    cardPaid: string;
    remainingBalance: string;
    change: string;
}

const initialState: PaymentState = {
    method: 'Card',
    cashPaid: '0',
    cardPaid: '0',
    remainingBalance: '0.00',
    change: '0.00',
};

type PaymentAction =
    | { type: 'SET_METHOD'; method: 'Card' | 'Cash' | 'Card → Cash' | 'Cash → Card' }
    | { type: 'SET_CASH_PAID'; cashPaid: string }
    | { type: 'SET_CARD_PAID'; cardPaid: string }
    | { type: 'SET_REMAINING_BALANCE'; remainingBalance: string }
    | { type: 'SET_CHANGE'; change: string }
    | { type: 'RESET' };

const paymentReducer = (state: PaymentState, action: PaymentAction): PaymentState => {
    switch (action.type) {
        case 'SET_METHOD':
            return { ...state, method: action.method };
        case 'SET_CASH_PAID':
            return { ...state, cashPaid: action.cashPaid };
        case 'SET_CARD_PAID':
            return { ...state, cardPaid: action.cardPaid };
        case 'SET_REMAINING_BALANCE':
            return { ...state, remainingBalance: action.remainingBalance };
        case 'SET_CHANGE':
            return { ...state, change: action.change };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
};


interface Transaction extends PricingTotals {
    cash_paid: number;
    card_paid: number;
    change_given: number;
    transaction_date: Dayjs;
    payment_method: string;
}

interface CheckoutPayload extends AdditionalOrderInfo {
    status?: string;
    transaction: Transaction;
}

function getRemainingOrChange(num1: number, num2: number) {
    return max([num1 - num2, 0])?.toFixed(2)
}

const paymentOptions = ['Cash', 'Card', 'Cash → Card', 'Card → Cash'];

const commonPaidProps = {
    type: 'tel',
    fullWidth: true,
    InputProps: {
        startAdornment: <InputAdornment position="start">$</InputAdornment>
    }
}

export default function Checkout({ open, onClose, pricingTotals }: CheckoutProps) {
    const { setSnackbarMessage, setOpenSnackbar, setOpenPopup } = useContext(UIContext);
    const { activeOrder, setOrders, orders, setActiveOrder } = useContext(OrderContext)
    const { sendMessage } = useContext(WebSocketContext)

    const cardPaidRef = useRef<HTMLInputElement>(null);
    const cashPaidRef = useRef<HTMLInputElement>(null);

    const [state, dispatch] = useReducer(paymentReducer, initialState);

    const handleConfirm = async (printReceipt: boolean) => {
        if ((state.method === 'Cash' || state.method === 'Card → Cash') && parseFloat(state.cashPaid) < pricingTotals.total_amount - parseFloat(state.cardPaid)) {
            setSnackbarMessage('Insufficient amount paid.');
            setOpenSnackbar(true);
            return;
        }
        await handleCheckout();

        if (state.cashPaid !== '0' && state.change !== '0') {
            handleOpenCashDrawer();
        }

        onClose();

        if (printReceipt) {
            const printUrl = `/api/v1/orders/${activeOrder.id}/print_receipt`;
            try {
                await axios.post(printUrl);
            }
            catch (error) {
                console.error(error);
                setSnackbarMessage('Error printing receipt');
                setOpenSnackbar(true);
            }
        }
    }

    const postCheckoutOps = (data: Order) => {
        console.log(data);
        switch (data.status) {
            case 'completed':
                // orderless checkout is not a true order, purge
                setOrders(orders.filter(order => order.id !== activeOrder.id));
                setActiveOrder({ id: -1, status: '', created_at: '', transaction: {} })
                sessionStorage.removeItem('activeOrder');
                setOpenPopup(false);
                break;
            case 'submitted':
                // do not remove order from list, wait until truly completed
                setActiveOrder({
                    ...activeOrder, transaction: data.transaction
                });
                setOrders(orders.map(order => order.id === data.id ? { ...order, transaction: data.transaction } : order));
                sendMessage(JSON.stringify({ type: 'order-update', payload: { transaction: data.transaction, type: 'transaction', id: activeOrder.id } }));
                break;
            default:
                break;
        }
    }


    const handleCheckout = async () => {
        const updateOrderUrl = `/api/v1/orders/${activeOrder.id}/update`;

        let adjustedPaymentMethod = state.method;
        if (state.method === 'Cash → Card' && parseFloat(state.change) > 0) {
            adjustedPaymentMethod = 'Cash';
        }
        else if (state.method === 'Card → Cash' && parseFloat(state.remainingBalance) === 0) {
            adjustedPaymentMethod = 'Card';
        }

        let basePayload: CheckoutPayload = {
            transaction: {
                ...pricingTotals,
                cash_paid: parseFloat(state.cashPaid),
                card_paid: parseFloat(state.cardPaid),
                change_given: parseFloat(state.change!),
                transaction_date: dayjs(),
                payment_method: adjustedPaymentMethod
            }
        }

        if (activeOrder.status === 'pending') {
            basePayload = {
                ...basePayload,
                status: 'completed',
                customer_name: "Orderless",
                customer_phone_number: "(000) 000-0000",
                complete_at: dayjs()
            }
        }

        try {
            const res = await axios.patch(updateOrderUrl, basePayload);
            console.log(res.data);
            postCheckoutOps(res.data);
            setSnackbarMessage('Order paid.');
            setOpenSnackbar(true);
        }
        catch (error) {
            console.error(error);
        }
    };


    const handleMethodChange = (method: PaymentState['method']) => {
        dispatch({ type: 'RESET' });
        dispatch({ type: 'SET_METHOD', method });
        if (method === 'Card') {
            dispatch({ type: 'SET_CARD_PAID', cardPaid: pricingTotals.total_amount.toFixed(2) });
        }
        else {
            dispatch({ type: 'SET_REMAINING_BALANCE', remainingBalance: pricingTotals.total_amount.toFixed(2) });
        }
    };

    const isValidNumber = (value: string) => {
        const regex = /^\d*\.?\d*$/;
        return regex.test(value);
    };

    const handleCashPaidChange = (cashPaid: string) => {
        if (!isValidNumber(cashPaid)) return;
        dispatch({ type: 'SET_CASH_PAID', cashPaid });
        const cashPaidFloat = parseFloat(cashPaid);

        if (state.method === 'Cash' || cashPaidFloat > pricingTotals.total_amount) {
            const change = getRemainingOrChange(cashPaidFloat, pricingTotals.total_amount) || '0'
            dispatch({ type: 'SET_CHANGE', change });
        } else if (state.method === 'Cash → Card') {
            const remainingBalance = getRemainingOrChange(pricingTotals.total_amount, cashPaidFloat) || '0';
            dispatch({ type: 'SET_REMAINING_BALANCE', remainingBalance });
        } else if (state.method === 'Card → Cash') {
            const totalPaid = cashPaidFloat + parseFloat(state.cardPaid);
            const change = getRemainingOrChange(totalPaid, pricingTotals.total_amount) || '0';
            dispatch({ type: 'SET_CHANGE', change });
        }
    };

    const handleCardAmountChange = (cardPaid: string) => {
        if (!isValidNumber(cardPaid)) return;
        const cardPaidFloat = parseFloat(cardPaid);
        if (cardPaidFloat > pricingTotals.total_amount) return;
        dispatch({ type: 'SET_CARD_PAID', cardPaid });

        if (state.method === 'Card → Cash') {
            const remainingBalance = getRemainingOrChange(pricingTotals.total_amount, cardPaidFloat) || '0';
            dispatch({ type: 'SET_REMAINING_BALANCE', remainingBalance });
        }
    }

    const renderChildren = () => {
        return (
            <Fade in={open}>
                <CenterGrid container>
                    <CloseButton override={true} handleOnConfirmed={onClose} />
                    <CenterGrid item xs={12}>
                        <Typography variant='h4' mt={'8px'}>Total: ${pricingTotals.total_amount.toFixed(2)}</Typography>
                    </CenterGrid>

                    <CenterGrid item xs={12}><Divider /></CenterGrid>

                    <CenterGrid item xs={12}>
                        <TextFieldSmaller
                            variant='standard'
                            label='Payment Method'
                            fullWidth
                            select
                            value={state.method}
                            onChange={(e) => handleMethodChange(e.target.value as PaymentState['method'])}>
                            {paymentOptions.map((option, index) => (
                                <MenuItemSmaller key={index} value={option}>{option}</MenuItemSmaller>
                            ))}
                        </TextFieldSmaller>
                    </CenterGrid>
                    {state.method === 'Card → Cash' && (
                        <CenterGrid item xs={12} sx={{ position: 'relative' }}>
                            <TextFieldSmaller
                                variant='standard'
                                label={`Card paid`}
                                inputRef={cardPaidRef}
                                onFocus={() => cardPaidRef.current?.select()}
                                value={state.cardPaid || 0}
                                //error={state.cashPaid! < (pricingTotals.total_amount - state.cardAmount!)}
                                onChange={(e) => handleCardAmountChange(e.target.value)}
                                {...commonPaidProps} />
                            <Typography variant='h5' sx={{ position: 'absolute', top: '1.8rem', right: '0.5rem' }}>
                                {`Remaining: $${state.remainingBalance}`}
                            </Typography>
                        </CenterGrid>
                    )}
                    {(state.method.startsWith('Cash') || (state.method === 'Card → Cash' && parseFloat(state.cardPaid) > 0 && parseFloat(state.remainingBalance) > 0)) && (
                        <CenterGrid item xs={12} sx={{ position: 'relative' }}>
                            <TextFieldSmaller
                                variant='standard'
                                label={`Cash paid`}
                                inputRef={cashPaidRef}
                                onFocus={() => cashPaidRef.current?.select()}
                                value={state.cashPaid || 0}
                                //error={state.cashPaid! < pricingTotals.total_amount && state.method === 'Cash'}
                                onChange={(e) => handleCashPaidChange(e.target.value)}
                                {...commonPaidProps} />
                            <Typography variant='h5' sx={{ position: 'absolute', top: '1.8rem', right: '0.5rem' }}>
                                {state.method === 'Card → Cash' || parseFloat(state.cashPaid) > pricingTotals.total_amount
                                    ? `Change: $${state.change}`
                                    : `Remaining: $${state.remainingBalance}`}
                            </Typography>
                        </CenterGrid>
                    )}
                    {state.method && (
                        <>
                            <CenterGrid item xs={12}>
                                <ConfirmationButton
                                    onConfirmed={() => handleConfirm(true)}
                                    onUnconfirmed={() => handleConfirm(false)}
                                    dialogContent='Print receipt?'>
                                    Confirm
                                </ConfirmationButton>
                            </CenterGrid>
                        </>
                    )}
                </CenterGrid>
            </Fade>
        );
    };

    return (
        <TransitionsModal openPopup={open} handleClosePopup={onClose} popup_sx={{ left: '50%', width: '40vw', border: 'none' }}
            children={renderChildren()}
        />

    );
}
