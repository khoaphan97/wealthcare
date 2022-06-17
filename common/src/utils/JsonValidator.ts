// import { ruleCompiler } from "./ruleCompiler";

import { ruleCompiler } from './ruleCompiler';

type Primitive = "array" | "boolean" | "integer" | "null" | "number" | "object" | "string";

export class JsonValidator {
    private _schema: {
        type: Primitive,
        required?: string[],
        rules?: string[],
        properties?: {
            [key: string]: {
                type?: Primitive;
                rules?: any[];
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
            this._compileSchema[this._activeProperty].checkers.push(ruleCompiler(rule.rule, rule.message));
        })
        this._activeProperty = null;
    }

    validateAll() {

    }

    validateProperty(propName: string, value: any) {
        for (let index = 0; index < this._compileSchema[propName].checkers.length; index++) {
            const checker = this._compileSchema[propName].checkers[index];
            const validationResult = checker(value);
            console.log(validationResult);
            if (validationResult.errorMessage) {
                this._errors = {
                    [propName]: validationResult.errorMessage
                };
                break;
            }
        }
    }

    addProps(key: string) {
        this._activeProperty = key;
        this._schema.properties[key] = {
            rules: []
        };
        this._schema.required.push(key);
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

    isEmail(message: string) {
        if (this._activeProperty) {
            this._schema.properties[this._activeProperty].type = 'string';
            this._schema.properties[this._activeProperty].rules.push({
                rule: 'email',
                message: message || 'default',
            });
        }
        return this;
    }

    maxLength(value: number, message: string) {
        if (!this._schema.properties[this._activeProperty].type) {
            throw new Error("Must define property type before apply rule");
        }

        if (this._schema.properties[this._activeProperty].type === 'number') {
            throw new Error("Rule maxLength cannot be applied to properties with type number")
        }

        this._schema.properties[this._activeProperty].rules.push({
            rule: `maxLength:${value}`,
            message: message || 'default',
        });
        return this;
    }

    minLength(value: number, message: string) {
        this._schema.properties[this._activeProperty].rules.push({
            rule: `minLength:${value}`,
            message: message || 'default',
        });
        return this;
    }

    match(regExp: RegExp, message: string) {
        this._schema.properties[this._activeProperty].rules.push({
            rule: `match:${regExp}`,
            message: message || 'default',
        });
        return this;
    }

    min(value: number, message: string) {
        if (this._schema.properties[this._activeProperty].type === 'string') {
            throw new Error("Rule min cannot be applied to properties with type string")
        }

        this._schema.properties[this._activeProperty].rules.push({
            rule: `min:${value}`,
            message: message || 'default',
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
