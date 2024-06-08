import React from 'react';
import { TextFieldSmaller, MobileDateTimePicker } from '../Styled';
import { CenterGrid } from '../Styled';
import { AdditionalOrderInfo } from '../BaseComps/dbTypes';
import dayjs, { Dayjs } from 'dayjs';
import { validatePhoneNumber, validateDate } from './utils/orderUtils';

interface OrderInfoInputProps {
    additionalOrderInfo: AdditionalOrderInfo;
    handleChangeAdditionalOrderInfo: (key: string, value: string | Dayjs | unknown) => void;
    status: string;
    overrideSubmit?: boolean;
    disableCondition: any;
}

const OrderInfoInput: React.FC<OrderInfoInputProps> = ({ additionalOrderInfo, handleChangeAdditionalOrderInfo, status, overrideSubmit, disableCondition }) => {

    return (
        <>
            <CenterGrid item xs={3.5}>
                <TextFieldSmaller
                    label='Name'
                    value={additionalOrderInfo.customer_name}
                    variant='filled'
                    fullWidth
                    onChange={(e) => handleChangeAdditionalOrderInfo('customer_name', e.target.value)}
                    error={additionalOrderInfo.customer_name === ''}
                    disabled={disableCondition}
                />
            </CenterGrid>
            <CenterGrid item xs={3.5}>
                <TextFieldSmaller
                    label='Phone Number'
                    value={additionalOrderInfo.customer_phone_number}
                    variant='filled'
                    type='tel'
                    fullWidth
                    onChange={(e) => handleChangeAdditionalOrderInfo('customer_phone_number', e.target.value)}
                    error={!validatePhoneNumber(additionalOrderInfo.customer_phone_number || '')}
                    disabled={disableCondition}
                />
            </CenterGrid>
            <CenterGrid item xs={5}>
                <MobileDateTimePicker
                    label='Complete at'
                    value={additionalOrderInfo.complete_at}
                    minutesStep={5}
                    slotProps={{ textField: { variant: "filled", error: !overrideSubmit && !validateDate(additionalOrderInfo.complete_at || dayjs(), status) } }}
                    views={['month', 'day', 'hours', 'minutes']}
                    onChange={(date) => handleChangeAdditionalOrderInfo('complete_at', date)}
                    timezone={dayjs.tz.guess()}
                    disabled={disableCondition}
                />
            </CenterGrid>
        </>
    );
};

export default OrderInfoInput;
