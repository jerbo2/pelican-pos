import React, { useContext, useState, useEffect } from "react";
import { FormConfigContext } from "../Configuration/contexts/FormConfigContext";
import { CenterGrid, Divider } from "../Styled";
import BasePreviewComponent from "../BaseComps/BasePreviewComponent";
import BaseToolBar from "../BaseComps/BaseToolBar";
import ConfirmationButton from "../BaseComps/ConfirmationButton";
import { FormValue } from "../BaseComps/dbTypes";

const confirmCancelOrderText = 'Are you sure you want to cancel?'
const confirmSubmitWithoutAllFieldsText = 'Some fields are not filled out, is that okay?'

interface NewOrderBaseProps {
    pageName: string;
    initialValues?: FormValue[];
    handleSubmit: () => void;
    handleCancel: () => void;
    // optionals for base form
    toolbarLeftIcon?: React.ReactNode;
    showCards?: boolean;
}

export default function NewOrderFormBase({ pageName, initialValues, handleSubmit, handleCancel, toolbarLeftIcon, showCards }: NewOrderBaseProps) {
    const { formConfig } = useContext(FormConfigContext);
    const [formValues, setFormValues] = useState<FormValue[]>([]);
    const [emptyFormConfirm, setEmptyFormConfirm] = useState(true);

    useEffect(() => {
        // check if all formValues are filled out
        if (formValues.every(formValue => formValue.value !== '')) {
            setEmptyFormConfirm(true);
        } else {
            setEmptyFormConfirm(false);
        }
        console.log(formValues)
    }, [formValues])

    useEffect(() => {
        // create initial form values from formConfig (label with empty val)
        const initialFormValues = initialValues || formConfig.map(config => ({
            label: config.label,
            value: ''
        }));
        setFormValues(initialFormValues);
    }, [initialValues, formConfig]);

    return (
        <CenterGrid container>
            <CenterGrid item xs={12}>
                <BaseToolBar pageName={pageName} leftIcon={showCards ? toolbarLeftIcon : null} />
            </CenterGrid>
            {!showCards && (
                <>
                    {formConfig.map((_, index) => (
                        <React.Fragment key={index}>
                            <CenterGrid item xs={12}>
                                <BasePreviewComponent component={formConfig[index]} formValues={formValues} setFormValues={setFormValues} index={index} initialValue={formValues[index]?.value} />
                            </CenterGrid>
                            <CenterGrid item key={`${index}_divider`} xs={12}>
                                <Divider />
                            </CenterGrid>
                        </React.Fragment>
                    ))}
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={handleCancel} dialogContent={confirmCancelOrderText}>CANCEL</ConfirmationButton>
                    </CenterGrid>
                    <CenterGrid item xs={6}>
                        <ConfirmationButton onConfirmed={handleSubmit} override={emptyFormConfirm} dialogContent={confirmSubmitWithoutAllFieldsText}>SUBMIT</ConfirmationButton>
                    </CenterGrid>
                </>
            )}
        </CenterGrid>
    );
}

export type { FormValue }