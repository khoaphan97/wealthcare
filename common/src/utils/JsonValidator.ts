// import { ruleCompiler } from "./ruleCompiler";

import { ruleCompiler, ValidationRules } from './ruleCompiler';

type Primitive = "array" | "boolean" | "integer" | "null" | "number" | "object" | "string";

export class JsonValidator {
    private _schema: {
        type: Primitive,
        required?: string[],
        rules?: string[],
        properties?: {
            [key: string]: {
                type?: Primitive;
                rules?: {
                    rule: ValidationRules;
                    value?: any;
                    message: string;
                }[];
            }
        },
    } = { type: 'object' };
    private _activeProperty: string = null;
    private _errors: {
        [key: string]: string;
    } = null;
    private _compileSchema: {
        [key: string]: {
            type: Primitive;
            checkers: Function[];
        }
    } = null;

    // "array" | "boolean" | "integer" | "null" | "number" | "object" | "string"
    constructor(type: Primitive) {
        this._schema = {
            type: type,
            properties: {},
            required: [],
        };
        this._activeProperty = null;
        this._compileSchema = {};
    }

    compile() {
        this._compileSchema[this._activeProperty] = {
            type: this._schema.properties[this._activeProperty].type,
            checkers: [],
        }
        this._schema.properties[this._activeProperty].rules.map((rule) => {
            this._compileSchema[this._activeProperty].checkers.push(ruleCompiler(rule));
        })
        this._activeProperty = null;
    }

    validateAll(data: any) {
        for (let property in data) {
            if (data[property] !== undefined) {
                this.validateProperty(property, data[property]);
            } else {
                this._errors = {
                    ...this._errors,
                    [property]: `Property ${property} is required`
                }
            }
        }
    }

    validateProperty(propName: string, value: any) {
        if(this._compileSchema[propName] === undefined) {
            throw new Error(`Property ${propName} is not compiled`);
        }
        for (let index = 0; index < this._compileSchema[propName].checkers.length; index++) {
            const checker = this._compileSchema[propName].checkers[index];
            const validationResult = checker(value);
            if (validationResult.errorMessage) {
                this._errors = {
                    ...this._errors,
                    [propName]: validationResult.errorMessage
                };
                break;
            }
        }
    }

    require(key: string) {
        this._activeProperty = key;
        this._schema.properties[key] = {
            rules: []
        };
        this._schema.required.push(key);
        return this;
    }

    option(key: string) {
        this._activeProperty = key;
        this._schema.properties[key] = {
            rules: []
        };
        return this;
    }

    isNumber() {
        if (this._activeProperty) {
            this._schema.properties[this._activeProperty].type = 'number';
        }
        return this;
    }

    isString() {
        if (this._activeProperty) {
            this._schema.properties[this._activeProperty].type = 'string';
        }
        return this;
    }

    isEmail(errorMessage?: string) {
        if (this._activeProperty) {
            this._schema.properties[this._activeProperty].type = 'string';
            this._schema.properties[this._activeProperty].rules.push({
                rule: 'email',
                message: errorMessage || 'default',
            });
        }
        return this;
    }

    maxLength(value: number, errorMessage?: string) {
        if (!this._schema.properties[this._activeProperty].type) {
            throw new Error("Must define property type before apply rule");
        }

        if (this._schema.properties[this._activeProperty].type === 'number') {
            throw new Error("Rule maxLength cannot be applied to properties with type number")
        }

        this._schema.properties[this._activeProperty].rules.push({
            rule: "maxLength",
            value,
            message: errorMessage || 'default',
        });
        return this;
    }

    minLength(value: number, errorMessage?: string) {
        this._schema.properties[this._activeProperty].rules.push({
            rule: "minLength",
            value,
            message: errorMessage || 'default',
        });
        return this;
    }

    hasPattern(regExp: RegExp, errorMessage?: string) {
        this._schema.properties[this._activeProperty].rules.push({
            rule: "pattern",
            value: regExp,
            message: errorMessage || 'default',
        });
        return this;
    }
    
    min(value: number, errorMessage?: string) {
        if (this._schema.properties[this._activeProperty].type === 'string') {
            throw new Error("Rule min cannot be applied to properties with type string")
        }

        this._schema.properties[this._activeProperty].rules.push({
            rule: "min",
            value,
            message: errorMessage || 'default',
        });
        return this;
    }

    equalTo(compare: any, errorMessage?: string) {
        this._schema.properties[this._activeProperty].rules.push({
            rule: "equalTo",
            value: compare,
            message: errorMessage || 'default',
        });
        return this;
    }

    get errors() {
        return this._errors;
    }
}

// const validator = new RequestValidator('object');

// validator.addProps('foo').isEmail().minLength(12).compile();

// validator.validateProperty('foo', 'a@gl.com');
