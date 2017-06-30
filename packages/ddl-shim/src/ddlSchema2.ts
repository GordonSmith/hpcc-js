/* tslint:disable */  
export const ddlSchema2 =  
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "definitions": {
        "IDatabomb": {
            "additionalProperties": false,
            "properties": {
                "data": {
                    "type": "string"
                }
            },
            "required": [
                "data"
            ],
            "type": "object"
        },
        "ILogicalFile": {
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            },
            "required": [
                "name",
                "url"
            ],
            "type": "object"
        },
        "IWUResult": {
            "additionalProperties": false,
            "properties": {
                "resultName": {
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
                "resultName",
                "url",
                "wuid"
            ],
            "type": "object"
        }
    },
    "items": {
        "anyOf": [
            {
                "$ref": "#/definitions/IWUResult"
            },
            {
                "$ref": "#/definitions/ILogicalFile"
            },
            {
                "$ref": "#/definitions/IDatabomb"
            }
        ]
    },
    "type": "array"
}

; 
