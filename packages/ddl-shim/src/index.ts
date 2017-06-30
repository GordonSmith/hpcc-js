import * as Ajv from "ajv";
export * from "./ddl";
export * from "./ddl2";
import { ddlSchema } from "./ddlSchema";
import { ddlSchema2 } from "./ddlSchema2";

export interface Response {
    success: boolean;
    errors: any;
}

export function validate(ddl: object): Response {
    const ajv = new Ajv();
    return {
        success: ajv.validate(ddlSchema, ddl),
        errors: ajv.errors
    };
}

export function validate2(ddl: object): Response {
    const ajv = new Ajv();
    return {
        success: ajv.validate(ddlSchema2, ddl),
        errors: ajv.errors
    };
}
