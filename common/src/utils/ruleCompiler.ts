/**
 * 
 * @param rule
 * Available options:
 * email - for email validation
 * match:{regExp} - for matching regExp
 * maxLength:{value} - string has max length of value 
 * @returns checker function
 */

export type ValidationRules = "email" | "min" | "minLength" | "max" | "maxLength" | "pattern" | "equalTo";

const defaultMessages = {
    email: 'Wrong email format',
    min: 'Value must be larger than or equal to [value]',
    minLength: 'Text must have the minimum length of [value]',
    max: 'Value must be less than or equal to [value]',
    maxLength: 'Text must have the maximum length of [value]',
    pattern: 'Text must match the provide pattern',
    equalTo: "Value does not match the compare value",
}

const generateMessage = (rule: ValidationRules, value: any, message: string) => {
    return message === 'default' ? defaultMessages[rule].replace('[value]', value) : message;
}

export const ruleCompiler = (data: {
    rule: ValidationRules;
    value?: any;
    message: string;
}) => {
    const { rule, value, message } = data;

    const errorMessage = generateMessage(rule, value, message);
    switch (rule) {
        case 'maxLength':
            return (testValue: string) => testValue.length <= Number(value) || { errorMessage };
        case 'minLength':
            return (testValue: string) => testValue.length >= Number(value) || { errorMessage };
        case 'min':
            return (testValue: number) => testValue >= Number(value) || { errorMessage };
        case 'pattern':
            return (testValue: string) => new RegExp(value).test(testValue) || { errorMessage };
        case 'equalTo':
            return (testValue: any) => JSON.stringify(testValue) === JSON.stringify(value) || { errorMessage };
        case 'email':
            return (testValue: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(testValue) ? true : { errorMessage };
        default:
            throw new Error(`Rule ${rule} is not supported`);
    }
}