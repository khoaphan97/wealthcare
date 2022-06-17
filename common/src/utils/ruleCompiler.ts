/**
 * 
 * @param rule
 * Available options:
 * email - for email validation
 * match:{regExp} - for matching regExp
 * maxLength:{value} - string has max length of value 
 * @returns checker function
 */

type ValidationRules = "email" | "min" | "minLength" | "max" | "maxLength" | "match";

const defaultMessages = {
    email: 'Wrong email format',
    min: 'Value must be larger than or equal to [value]',
    minLength: 'Text must have the minimum length of [value]',
    max: 'Value must be less than or equal to [value]',
    maxLength: 'Text must have the maximum length of [value]',
    match: 'Text must match the provide pattern',
}

const generateMessage = (rule: ValidationRules, value: any, message: string) => {
    return message === 'default' ? defaultMessages[rule].replace('[value]', value) : message;
}

export const ruleCompiler = (rule: ValidationRules, message: string) => {
    if (rule.split(':').length > 1) {
        const format = rule.split(':')[0] as ValidationRules;
        const value = rule.split(':')[1];
        const errorMessage = generateMessage(format, value, message);
        switch (format) {
            case 'maxLength':
                return (testValue: string) => testValue.length <= Number(value) ? true : { errorMessage };
            case 'minLength':
                return (testValue: string) => testValue.length >= Number(value) ? true : { errorMessage };
            case 'min':
                return (testValue: number) => testValue >= Number(value) ? true : { errorMessage };
            case 'match':
                return (testValue: string) => new RegExp(value).test(testValue) ? true : { errorMessage };
            default:
                throw new Error(`Rule ${format} is not supported`);
        }
    } else {
        const errorMessage = generateMessage(rule, '', message);
        switch (rule) {
            case 'email':
                return (testValue: string) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(testValue) ? true : { errorMessage };
            default:
                throw new Error(`Rule ${rule} is not supported`);
        }
    }
}