/* tslint:disable */  
export const ddlSchema2 =  
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "additionalProperties": false,
    "definitions": {
        "IDatabomb": {
            "additionalProperties": false,
            "properties": {
                "data": {
                    "additionalItems": {
                        "anyOf": [
                            {
                                "additionalProperties": {
                                },
                                "type": "object"
                            }
                        ]
                    },
                    "items": [
                        {
                            "additionalProperties": {
                            },
                            "type": "object"
                        }
                    ],
                    "minItems": 1,
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
                "data",
                "id",
                "type"
            ],
            "type": "object"
        },
        "ILogicalFile": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "name": {
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
                "name",
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
                        "$ref": "#/definitions/IDatabomb"
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
