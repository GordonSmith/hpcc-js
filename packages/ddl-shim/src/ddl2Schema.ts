/* tslint:disable */  
export const ddl2Schema =  
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "additionalProperties": false,
    "definitions": {
        "IAggregate": {
            "additionalProperties": false,
            "properties": {
                "field": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "deviation",
                        "max",
                        "mean",
                        "min",
                        "sum",
                        "variance"
                    ],
                    "type": "string"
                }
            },
            "required": [
                "field",
                "type"
            ],
            "type": "object"
        },
        "ICalculated": {
            "additionalProperties": false,
            "properties": {
                "fieldID": {
                    "type": "string"
                },
                "param1": {
                    "type": "string"
                },
                "param2": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "*",
                        "+",
                        "-",
                        "/",
                        "="
                    ],
                    "type": "string"
                }
            },
            "required": [
                "fieldID",
                "param1",
                "param2",
                "type"
            ],
            "type": "object"
        },
        "ICount": {
            "additionalProperties": false,
            "properties": {
                "type": {
                    "enum": [
                        "count"
                    ],
                    "type": "string"
                }
            },
            "required": [
                "type"
            ],
            "type": "object"
        },
        "IDatabomb": {
            "additionalProperties": false,
            "properties": {
                "data": {
                    "items": {
                        "additionalProperties": {
                        },
                        "type": "object"
                    },
                    "type": "array"
                },
                "id": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "databomb"
                    ],
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
        "IField": {
            "additionalProperties": false,
            "properties": {
                "default": {
                },
                "id": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "boolean",
                        "number",
                        "string"
                    ],
                    "type": "string"
                }
            },
            "required": [
                "default",
                "id",
                "type"
            ],
            "type": "object"
        },
        "IFilter": {
            "additionalProperties": false,
            "properties": {
                "mappings": {
                    "items": {
                        "$ref": "#/definitions/IMapping"
                    },
                    "type": "array"
                },
                "nullable": {
                    "type": "boolean"
                },
                "viewID": {
                    "type": "string"
                }
            },
            "required": [
                "mappings",
                "nullable",
                "viewID"
            ],
            "type": "object"
        },
        "IForm": {
            "additionalProperties": false,
            "properties": {
                "fields": {
                    "items": {
                        "$ref": "#/definitions/IField"
                    },
                    "type": "array"
                },
                "id": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "form"
                    ],
                    "type": "string"
                }
            },
            "required": [
                "fields",
                "id",
                "type"
            ],
            "type": "object"
        },
        "IGroupBy": {
            "additionalProperties": false,
            "properties": {
                "aggregates": {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/IAggregate"
                            },
                            {
                                "$ref": "#/definitions/ICount"
                            }
                        ]
                    },
                    "type": "array"
                },
                "fields": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array"
                }
            },
            "required": [
                "aggregates",
                "fields"
            ],
            "type": "object"
        },
        "IHipieService": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "hipieservice"
                    ],
                    "type": "string"
                }
            },
            "required": [
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
                "logicalFile": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "logicalfile"
                    ],
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "logicalFile",
                "type",
                "url"
            ],
            "type": "object"
        },
        "IMapping": {
            "additionalProperties": false,
            "properties": {
                "condition": {
                    "enum": [
                        "!=",
                        "<",
                        "<=",
                        "==",
                        ">",
                        ">=",
                        "contains"
                    ],
                    "type": "string"
                },
                "localFieldID": {
                    "type": "string"
                },
                "remoteFieldID": {
                    "type": "string"
                }
            },
            "required": [
                "condition",
                "localFieldID",
                "remoteFieldID"
            ],
            "type": "object"
        },
        "IRoxieService": {
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "queryID": {
                    "type": "string"
                },
                "querySet": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "roxieservice"
                    ],
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            },
            "required": [
                "id",
                "queryID",
                "querySet",
                "type",
                "url"
            ],
            "type": "object"
        },
        "IScale": {
            "additionalProperties": false,
            "properties": {
                "factor": {
                    "type": "number"
                },
                "fieldID": {
                    "type": "string"
                },
                "param1": {
                    "type": "string"
                },
                "type": {
                    "enum": [
                        "scale"
                    ],
                    "type": "string"
                }
            },
            "required": [
                "factor",
                "fieldID",
                "param1",
                "type"
            ],
            "type": "object"
        },
        "ISort": {
            "additionalProperties": false,
            "properties": {
                "descending": {
                    "type": "boolean"
                },
                "fieldID": {
                    "type": "string"
                }
            },
            "required": [
                "descending",
                "fieldID"
            ],
            "type": "object"
        },
        "IView": {
            "additionalProperties": false,
            "properties": {
                "datasourceID": {
                    "type": "string"
                },
                "filters": {
                    "items": {
                        "$ref": "#/definitions/IFilter"
                    },
                    "type": "array"
                },
                "groupBy": {
                    "$ref": "#/definitions/IGroupBy"
                },
                "id": {
                    "type": "string"
                },
                "limit": {
                    "type": "number"
                },
                "preProject": {
                    "items": {
                        "anyOf": [
                            {
                                "$ref": "#/definitions/IScale"
                            },
                            {
                                "$ref": "#/definitions/ICalculated"
                            }
                        ]
                    },
                    "type": "array"
                },
                "sort": {
                    "items": {
                        "$ref": "#/definitions/ISort"
                    },
                    "type": "array"
                }
            },
            "required": [
                "datasourceID",
                "id"
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
                    "enum": [
                        "wuresult"
                    ],
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
                        "$ref": "#/definitions/IRoxieService"
                    },
                    {
                        "$ref": "#/definitions/IForm"
                    },
                    {
                        "$ref": "#/definitions/IDatabomb"
                    },
                    {
                        "$ref": "#/definitions/IHipieService"
                    }
                ]
            },
            "type": "array"
        },
        "views": {
            "items": {
                "$ref": "#/definitions/IView"
            },
            "type": "array"
        }
    },
    "required": [
        "datasources",
        "views"
    ],
    "type": "object"
}

; 
