export const validateNumberOrRatio = (input: string) => {
    console.log(input);
    const numberRegex = /^\d*\.?\d*$/;
    const ratioRegex = /^\((\d*\.?\d+)\s*\/\s*(\d*\.?\d+)\)$/;
    const partialRatioRegex = /^\((\d*\.?\d*)\s*\/?\s*(\d*\.?\d*)\)?$/;

    if (numberRegex.test(input)) {
        return { isValid: true, isPartial: false, value: input };
    }

    const ratioMatch = input.match(ratioRegex);
    if (ratioMatch) {
        const numerator = parseFloat(ratioMatch[1]);
        const denominator = parseFloat(ratioMatch[2]);
        if (denominator !== 0) {
            return { isValid: true, isPartial: false, value: (numerator / denominator).toString() };
        }
    }

    const partialRatioMatch = input.match(partialRatioRegex);
    if (partialRatioMatch) {
        return { isValid: true, isPartial: true, value: null };
    }

    return { isValid: false, isPartial: false, value: null };
};