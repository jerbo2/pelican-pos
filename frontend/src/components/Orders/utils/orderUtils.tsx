import dayjs, { Dayjs } from 'dayjs';
import { OrderItems, AdditionalOrderInfo } from '../../BaseComps/dbTypes';

export const getPriceInfo = (orderItems: OrderItems[]) => {
    const pricing = {
        total_non_taxable: 0,
        total_taxable: 0,
        collected_tax: 0,
        total_amount: 0,
    };
    orderItems.forEach(item => {
        if (item.tax !== 0) {
            pricing.total_taxable += item.price * item.quantity;
            pricing.collected_tax += item.quantity * item.tax;
        } else {
            pricing.total_non_taxable += item.price * item.quantity;
        }
    });
    pricing.total_amount = pricing.total_non_taxable + pricing.total_taxable;
    return pricing;
};

export const getTotalPrice = (orderItems: OrderItems[]) => {
    const pricing_info = getPriceInfo(orderItems);
    return (pricing_info.total_non_taxable + pricing_info.total_taxable).toFixed(2);
};

const formattedPhoneNumberRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
const phoneNumberRegex = /^\d{10}$/;

export const validatePhoneNumber = (phoneNumber: string) => {
    return (phoneNumber.match(formattedPhoneNumberRegex) || phoneNumber.match(phoneNumberRegex)) ? true : false;
};

export const validateDate = (date: Dayjs, status: string) => {
    if (status === 'submitted') return true;
    return date.isAfter(dayjs());
};

export const validateAdditionalOrderInfo = (info: AdditionalOrderInfo, status: string) => {
    if (Object.values(info).some(value => value === '')) {
        return 'Missing information.';
    }
    if (!validatePhoneNumber(info.customer_phone_number || '')) {
        return 'Invalid phone number.';
    }
    if (!validateDate(info.complete_at || dayjs(), status)) {
        return 'Invalid date.';
    }
    return null;
};
