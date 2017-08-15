/* tslint:disable */  
export const ddlSchema2 =  
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "additionalProperties": false,
    "definitions": {
        "ILogicalFile": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "type",
                "url"
            ],
            "type": "object"
        },
        "IQuery": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "set": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "set",
                "type",
                "url"
            ],
            "type": "object"
        },
        "IWUResult": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "resultName": {
                    "type": "string"
                },
                "type": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                },
                "wuid": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "resultName",
                "type",
                "url",
                "wuid"
            ],
            "type": "object"
        }
    },
    "properties": {
        "datasources": {
            "items": {
                "anyOf": [
                    {
                        "$ref": "#/definitions/IWUResult"
                    },
                    {
                        "$ref": "#/definitions/ILogicalFile"
                    },
                    {
                        "$ref": "#/definitions/IQuery"
                    }
                ]
            },
            "type": "array"
        },
        "id": {
            "type": "string"
        },
        "type": {
            "type": "string"
        }
    },
    "required": [
        "datasources",
        "id",
        "type"
    ],
    "type": "object"
}

; 
