'use strict';

var fs = require('fs');

var $ref = "#/definitions/Schema";
var $schema = "http://json-schema.org/draft-07/schema#";
var definitions = {
	ActivityType: {
		anyOf: [
			{
				$ref: "#/definitions/IFilter"
			},
			{
				$ref: "#/definitions/IProject"
			},
			{
				$ref: "#/definitions/IGroupBy"
			},
			{
				$ref: "#/definitions/ISort"
			},
			{
				$ref: "#/definitions/ILimit"
			},
			{
				$ref: "#/definitions/IMappings"
			}
		]
	},
	AggregateType: {
		anyOf: [
			{
				$ref: "#/definitions/IAggregate"
			},
			{
				$ref: "#/definitions/ICount"
			}
		]
	},
	Dataset: {
		items: {
		},
		type: "array"
	},
	DatasourceType: {
		anyOf: [
			{
				$ref: "#/definitions/ILogicalFile"
			},
			{
				$ref: "#/definitions/IForm"
			},
			{
				$ref: "#/definitions/IDatabomb"
			},
			{
				$ref: "#/definitions/IWUResult"
			},
			{
				$ref: "#/definitions/IHipieService"
			},
			{
				$ref: "#/definitions/IRoxieService"
			}
		]
	},
	IActivityType: {
		"enum": [
			"filter",
			"project",
			"groupby",
			"sort",
			"limit",
			"mappings"
		],
		type: "string"
	},
	IAggregate: {
		additionalProperties: false,
		properties: {
			baseCountFieldID: {
				type: "string"
			},
			fieldID: {
				type: "string"
			},
			inFieldID: {
				type: "string"
			},
			type: {
				$ref: "#/definitions/IAggregateType"
			}
		},
		required: [
			"fieldID",
			"type",
			"inFieldID"
		],
		type: "object"
	},
	IAggregateType: {
		"enum": [
			"min",
			"max",
			"sum",
			"mean",
			"variance",
			"deviation"
		],
		type: "string"
	},
	ICalculated: {
		additionalProperties: false,
		properties: {
			fieldID: {
				type: "string"
			},
			sourceFieldID1: {
				type: "string"
			},
			sourceFieldID2: {
				type: "string"
			},
			type: {
				$ref: "#/definitions/ICalculatedType"
			}
		},
		required: [
			"fieldID",
			"type",
			"sourceFieldID1",
			"sourceFieldID2"
		],
		type: "object"
	},
	ICalculatedType: {
		"enum": [
			"+",
			"-",
			"*",
			"/"
		],
		type: "string"
	},
	ICount: {
		additionalProperties: false,
		properties: {
			fieldID: {
				type: "string"
			},
			type: {
				"enum": [
					"count"
				],
				type: "string"
			}
		},
		required: [
			"fieldID",
			"type"
		],
		type: "object"
	},
	IDatabomb: {
		additionalProperties: false,
		properties: {
			fields: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			},
			format: {
				$ref: "#/definitions/IDatabombFormat"
			},
			id: {
				type: "string"
			},
			payload: {
				type: "string"
			},
			type: {
				"enum": [
					"databomb"
				],
				type: "string"
			}
		},
		required: [
			"fields",
			"format",
			"id",
			"type"
		],
		type: "object"
	},
	IDatabombFormat: {
		"enum": [
			"csv",
			"tsv",
			"json"
		],
		type: "string"
	},
	IDatabombRef: {
		additionalProperties: false,
		properties: {
			id: {
				type: "string"
			}
		},
		required: [
			"id"
		],
		type: "object"
	},
	IDatasource: {
		additionalProperties: false,
		properties: {
			fields: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			},
			id: {
				type: "string"
			},
			type: {
				$ref: "#/definitions/IDatasourceType"
			}
		},
		required: [
			"type",
			"id",
			"fields"
		],
		type: "object"
	},
	IDatasourceRef: {
		anyOf: [
			{
				$ref: "#/definitions/IDatabombRef"
			},
			{
				$ref: "#/definitions/IWUResultRef"
			},
			{
				$ref: "#/definitions/IRoxieServiceRef"
			}
		]
	},
	IDatasourceType: {
		anyOf: [
			{
				$ref: "#/definitions/IServiceType"
			},
			{
				"enum": [
					"logicalfile"
				],
				type: "string"
			},
			{
				"enum": [
					"form"
				],
				type: "string"
			},
			{
				"enum": [
					"databomb"
				],
				type: "string"
			}
		]
	},
	IEquals: {
		additionalProperties: false,
		properties: {
			fieldID: {
				type: "string"
			},
			sourceFieldID: {
				type: "string"
			},
			transformations: {
				items: {
					$ref: "#/definitions/MultiTransformationType"
				},
				type: "array"
			},
			type: {
				"enum": [
					"="
				],
				type: "string"
			}
		},
		required: [
			"fieldID",
			"type",
			"sourceFieldID"
		],
		type: "object"
	},
	IField: {
		anyOf: [
			{
				$ref: "#/definitions/IFieldBoolean"
			},
			{
				$ref: "#/definitions/IFieldNumber"
			},
			{
				$ref: "#/definitions/IFieldNumber64"
			},
			{
				$ref: "#/definitions/IFieldString"
			},
			{
				$ref: "#/definitions/IFieldRange"
			},
			{
				$ref: "#/definitions/IFieldDataset"
			},
			{
				$ref: "#/definitions/IFieldObject"
			}
		]
	},
	IFieldBoolean: {
		additionalProperties: false,
		properties: {
			"default": {
				type: "boolean"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"boolean"
				],
				type: "string"
			}
		},
		required: [
			"type",
			"id"
		],
		type: "object"
	},
	IFieldDataset: {
		additionalProperties: false,
		properties: {
			children: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			},
			"default": {
				$ref: "#/definitions/Dataset"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"dataset"
				],
				type: "string"
			}
		},
		required: [
			"type",
			"id",
			"children"
		],
		type: "object"
	},
	IFieldNumber: {
		additionalProperties: false,
		properties: {
			"default": {
				type: "number"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"number"
				],
				type: "string"
			}
		},
		required: [
			"type",
			"id"
		],
		type: "object"
	},
	IFieldNumber64: {
		additionalProperties: false,
		properties: {
			"default": {
				$ref: "#/definitions/Number64"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"number64"
				],
				type: "string"
			}
		},
		required: [
			"type",
			"id"
		],
		type: "object"
	},
	IFieldObject: {
		additionalProperties: false,
		properties: {
			"default": {
				type: "object"
			},
			fields: {
				additionalProperties: {
					$ref: "#/definitions/IField"
				},
				type: "object"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"object"
				],
				type: "string"
			}
		},
		required: [
			"type",
			"id",
			"fields"
		],
		type: "object"
	},
	IFieldRange: {
		additionalProperties: false,
		properties: {
			"default": {
				$ref: "#/definitions/Range"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"range"
				],
				type: "string"
			}
		},
		required: [
			"type",
			"id"
		],
		type: "object"
	},
	IFieldString: {
		additionalProperties: false,
		properties: {
			"default": {
				type: "string"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"string"
				],
				type: "string"
			}
		},
		required: [
			"type",
			"id"
		],
		type: "object"
	},
	IFieldType: {
		"enum": [
			"boolean",
			"number",
			"number64",
			"string",
			"range",
			"dataset",
			"object"
		],
		type: "string"
	},
	IFilter: {
		additionalProperties: false,
		properties: {
			conditions: {
				items: {
					$ref: "#/definitions/IFilterCondition"
				},
				type: "array"
			},
			type: {
				"enum": [
					"filter"
				],
				type: "string"
			}
		},
		required: [
			"conditions",
			"type"
		],
		type: "object"
	},
	IFilterCondition: {
		additionalProperties: false,
		properties: {
			mappings: {
				items: {
					$ref: "#/definitions/IMapping"
				},
				type: "array"
			},
			viewID: {
				type: "string"
			}
		},
		required: [
			"viewID",
			"mappings"
		],
		type: "object"
	},
	IForm: {
		additionalProperties: false,
		properties: {
			fields: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			},
			id: {
				type: "string"
			},
			type: {
				"enum": [
					"form"
				],
				type: "string"
			}
		},
		required: [
			"fields",
			"id",
			"type"
		],
		type: "object"
	},
	IGroupBy: {
		additionalProperties: false,
		properties: {
			aggregates: {
				items: {
					$ref: "#/definitions/AggregateType"
				},
				type: "array"
			},
			groupByIDs: {
				items: {
					type: "string"
				},
				type: "array"
			},
			type: {
				"enum": [
					"groupby"
				],
				type: "string"
			}
		},
		required: [
			"aggregates",
			"groupByIDs",
			"type"
		],
		type: "object"
	},
	IHipieService: {
		additionalProperties: false,
		properties: {
			id: {
				type: "string"
			},
			inputs: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			},
			outputs: {
				$ref: "#/definitions/OutputDict"
			},
			queryID: {
				type: "string"
			},
			querySet: {
				type: "string"
			},
			type: {
				"enum": [
					"hipie"
				],
				type: "string"
			},
			url: {
				type: "string"
			}
		},
		required: [
			"id",
			"inputs",
			"outputs",
			"queryID",
			"querySet",
			"type",
			"url"
		],
		type: "object"
	},
	ILimit: {
		additionalProperties: false,
		properties: {
			limit: {
				type: "number"
			},
			type: {
				"enum": [
					"limit"
				],
				type: "string"
			}
		},
		required: [
			"limit",
			"type"
		],
		type: "object"
	},
	ILogicalFile: {
		additionalProperties: false,
		properties: {
			fields: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			},
			id: {
				type: "string"
			},
			logicalFile: {
				type: "string"
			},
			type: {
				"enum": [
					"logicalfile"
				],
				type: "string"
			},
			url: {
				type: "string"
			}
		},
		required: [
			"fields",
			"id",
			"logicalFile",
			"type",
			"url"
		],
		type: "object"
	},
	IMap: {
		additionalProperties: false,
		properties: {
			"default": {
			},
			fieldID: {
				type: "string"
			},
			mappings: {
				items: {
					$ref: "#/definitions/IMapMapping"
				},
				type: "array"
			},
			sourceFieldID: {
				type: "string"
			},
			type: {
				"enum": [
					"map"
				],
				type: "string"
			}
		},
		required: [
			"fieldID",
			"type",
			"sourceFieldID",
			"default",
			"mappings"
		],
		type: "object"
	},
	IMapMapping: {
		additionalProperties: false,
		properties: {
			newValue: {
			},
			value: {
			}
		},
		required: [
			"value",
			"newValue"
		],
		type: "object"
	},
	IMapping: {
		additionalProperties: false,
		properties: {
			condition: {
				$ref: "#/definitions/IMappingConditionType"
			},
			localFieldID: {
				type: "string"
			},
			nullable: {
				type: "boolean"
			},
			remoteFieldID: {
				type: "string"
			}
		},
		required: [
			"remoteFieldID",
			"localFieldID",
			"condition",
			"nullable"
		],
		type: "object"
	},
	IMappingConditionType: {
		"enum": [
			"==",
			"!=",
			">",
			">=",
			"<",
			"<=",
			"range",
			"in"
		],
		type: "string"
	},
	IMappings: {
		additionalProperties: false,
		properties: {
			transformations: {
				items: {
					$ref: "#/definitions/ProjectTransformationType"
				},
				type: "array"
			},
			type: {
				"enum": [
					"mappings"
				],
				type: "string"
			}
		},
		required: [
			"transformations",
			"type"
		],
		type: "object"
	},
	IMulti: {
		additionalProperties: false,
		properties: {
			fieldID: {
				type: "string"
			},
			transformations: {
				items: {
					$ref: "#/definitions/MultiTransformationType"
				},
				type: "array"
			},
			type: {
				"enum": [
					"multi"
				],
				type: "string"
			}
		},
		required: [
			"fieldID",
			"type",
			"transformations"
		],
		type: "object"
	},
	IOutput: {
		additionalProperties: false,
		properties: {
			fields: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			}
		},
		required: [
			"fields"
		],
		type: "object"
	},
	IProject: {
		additionalProperties: false,
		properties: {
			transformations: {
				items: {
					$ref: "#/definitions/ProjectTransformationType"
				},
				type: "array"
			},
			type: {
				"enum": [
					"project"
				],
				type: "string"
			}
		},
		required: [
			"transformations",
			"type"
		],
		type: "object"
	},
	IProperties: {
		type: "object"
	},
	IRequestField: {
		additionalProperties: false,
		properties: {
			localFieldID: {
				type: "string"
			},
			remoteFieldID: {
				type: "string"
			},
			source: {
				type: "string"
			}
		},
		required: [
			"source",
			"remoteFieldID",
			"localFieldID"
		],
		type: "object"
	},
	IRoxieService: {
		additionalProperties: false,
		properties: {
			id: {
				type: "string"
			},
			inputs: {
				items: {
					$ref: "#/definitions/IField"
				},
				type: "array"
			},
			outputs: {
				$ref: "#/definitions/OutputDict"
			},
			queryID: {
				type: "string"
			},
			querySet: {
				type: "string"
			},
			type: {
				"enum": [
					"roxie"
				],
				type: "string"
			},
			url: {
				type: "string"
			}
		},
		required: [
			"id",
			"inputs",
			"outputs",
			"queryID",
			"querySet",
			"type",
			"url"
		],
		type: "object"
	},
	IRoxieServiceRef: {
		additionalProperties: false,
		properties: {
			id: {
				type: "string"
			},
			output: {
				type: "string"
			},
			request: {
				items: {
					$ref: "#/definitions/IRequestField"
				},
				type: "array"
			}
		},
		required: [
			"id",
			"output",
			"request"
		],
		type: "object"
	},
	IScale: {
		additionalProperties: false,
		properties: {
			factor: {
				type: "number"
			},
			fieldID: {
				type: "string"
			},
			sourceFieldID: {
				type: "string"
			},
			type: {
				"enum": [
					"scale"
				],
				type: "string"
			}
		},
		required: [
			"fieldID",
			"type",
			"sourceFieldID",
			"factor"
		],
		type: "object"
	},
	IServiceType: {
		"enum": [
			"wuresult",
			"hipie",
			"roxie"
		],
		type: "string"
	},
	ISort: {
		additionalProperties: false,
		properties: {
			conditions: {
				items: {
					$ref: "#/definitions/ISortCondition"
				},
				type: "array"
			},
			type: {
				"enum": [
					"sort"
				],
				type: "string"
			}
		},
		required: [
			"conditions",
			"type"
		],
		type: "object"
	},
	ISortCondition: {
		additionalProperties: false,
		properties: {
			descending: {
				type: "boolean"
			},
			fieldID: {
				type: "string"
			}
		},
		required: [
			"fieldID",
			"descending"
		],
		type: "object"
	},
	ITemplate: {
		additionalProperties: false,
		properties: {
			fieldID: {
				type: "string"
			},
			template: {
				type: "string"
			},
			type: {
				"enum": [
					"template"
				],
				type: "string"
			}
		},
		required: [
			"fieldID",
			"type",
			"template"
		],
		type: "object"
	},
	IView: {
		additionalProperties: false,
		properties: {
			activities: {
				items: {
					$ref: "#/definitions/ActivityType"
				},
				type: "array"
			},
			datasource: {
				$ref: "#/definitions/IDatasourceRef"
			},
			id: {
				type: "string"
			},
			visualization: {
				$ref: "#/definitions/IVisualization"
			}
		},
		required: [
			"id",
			"datasource",
			"activities",
			"visualization"
		],
		type: "object"
	},
	IVisualization: {
		additionalProperties: false,
		properties: {
			__class: {
				type: "string"
			},
			chartType: {
				type: "string"
			},
			description: {
				type: "string"
			},
			id: {
				type: "string"
			},
			mappings: {
				$ref: "#/definitions/IMappings"
			},
			properties: {
				$ref: "#/definitions/IWidgetProperties"
			},
			title: {
				type: "string"
			},
			visibility: {
				$ref: "#/definitions/VisibilityType"
			}
		},
		required: [
			"__class",
			"chartType",
			"id",
			"mappings",
			"properties",
			"title",
			"visibility"
		],
		type: "object"
	},
	IWUResult: {
		additionalProperties: false,
		properties: {
			id: {
				type: "string"
			},
			outputs: {
				$ref: "#/definitions/OutputDict"
			},
			type: {
				"enum": [
					"wuresult"
				],
				type: "string"
			},
			url: {
				type: "string"
			},
			wuid: {
				type: "string"
			}
		},
		required: [
			"id",
			"outputs",
			"type",
			"url",
			"wuid"
		],
		type: "object"
	},
	IWUResultRef: {
		additionalProperties: false,
		properties: {
			id: {
				type: "string"
			},
			output: {
				type: "string"
			}
		},
		required: [
			"id",
			"output"
		],
		type: "object"
	},
	IWidgetProperties: {
		additionalProperties: {
			anyOf: [
				{
					type: "string"
				},
				{
					items: {
						type: "string"
					},
					type: "array"
				},
				{
					type: "number"
				},
				{
					type: "boolean"
				},
				{
					not: {
					}
				},
				{
					$ref: "#/definitions/IWidgetProperties"
				},
				{
					items: {
						$ref: "#/definitions/IWidgetProperties"
					},
					type: "array"
				}
			]
		},
		properties: {
			__class: {
				type: "string"
			}
		},
		required: [
			"__class"
		],
		type: "object"
	},
	MultiTransformationType: {
		anyOf: [
			{
				$ref: "#/definitions/IEquals"
			},
			{
				$ref: "#/definitions/ICalculated"
			},
			{
				$ref: "#/definitions/IScale"
			},
			{
				$ref: "#/definitions/ITemplate"
			},
			{
				$ref: "#/definitions/IMap"
			}
		]
	},
	Number64: {
		type: "string"
	},
	OutputDict: {
		additionalProperties: {
			$ref: "#/definitions/IOutput"
		},
		type: "object"
	},
	ProjectTransformationType: {
		anyOf: [
			{
				$ref: "#/definitions/MultiTransformationType"
			},
			{
				$ref: "#/definitions/IMulti"
			}
		]
	},
	Range: {
		items: [
			{
				type: [
					"number",
					"string"
				]
			},
			{
				type: [
					"number",
					"string"
				]
			}
		],
		maxItems: 2,
		minItems: 2,
		type: "array"
	},
	Schema: {
		additionalProperties: false,
		properties: {
			createdBy: {
				additionalProperties: false,
				properties: {
					name: {
						type: "string"
					},
					version: {
						type: "string"
					}
				},
				required: [
					"name",
					"version"
				],
				type: "object"
			},
			datasources: {
				items: {
					$ref: "#/definitions/DatasourceType"
				},
				type: "array"
			},
			dataviews: {
				items: {
					$ref: "#/definitions/IView"
				},
				type: "array"
			},
			defs: {
				additionalProperties: false,
				properties: {
					activityTypes: {
						additionalProperties: false,
						properties: {
							filter: {
								$ref: "#/definitions/IFilter"
							},
							groupby: {
								$ref: "#/definitions/IGroupBy"
							},
							limit: {
								$ref: "#/definitions/ILimit"
							},
							mappings: {
								$ref: "#/definitions/IMappings"
							},
							project: {
								$ref: "#/definitions/IProject"
							},
							sort: {
								$ref: "#/definitions/ISort"
							}
						},
						required: [
							"filter",
							"project",
							"groupby",
							"sort",
							"limit",
							"mappings"
						],
						type: "object"
					},
					aggregateTypes: {
						additionalProperties: false,
						properties: {
							aggregate: {
								$ref: "#/definitions/IAggregate"
							},
							count: {
								$ref: "#/definitions/ICount"
							}
						},
						required: [
							"aggregate",
							"count"
						],
						type: "object"
					},
					datasourceRefTypes: {
						additionalProperties: false,
						properties: {
							roxieServiceRef: {
								$ref: "#/definitions/IRoxieServiceRef"
							},
							wuResultRef: {
								$ref: "#/definitions/IWUResultRef"
							}
						},
						required: [
							"wuResultRef",
							"roxieServiceRef"
						],
						type: "object"
					},
					datasourceTypes: {
						additionalProperties: false,
						properties: {
							databomb: {
								$ref: "#/definitions/IDatabomb"
							},
							datasource: {
								$ref: "#/definitions/IDatasource"
							},
							form: {
								$ref: "#/definitions/IForm"
							},
							hipieService: {
								$ref: "#/definitions/IHipieService"
							},
							logicalFile: {
								$ref: "#/definitions/ILogicalFile"
							},
							roxieService: {
								$ref: "#/definitions/IRoxieService"
							},
							wuresult: {
								$ref: "#/definitions/IWUResult"
							}
						},
						required: [
							"datasource",
							"logicalFile",
							"form",
							"databomb",
							"wuresult",
							"hipieService",
							"roxieService"
						],
						type: "object"
					},
					fieldTypes: {
						additionalProperties: false,
						properties: {
							dataset: {
								$ref: "#/definitions/Dataset"
							},
							field: {
								$ref: "#/definitions/IField"
							},
							fieldBoolean: {
								$ref: "#/definitions/IFieldBoolean"
							},
							fieldDataset: {
								$ref: "#/definitions/IFieldDataset"
							},
							fieldNumber: {
								$ref: "#/definitions/IFieldNumber"
							},
							fieldNumber64: {
								$ref: "#/definitions/IFieldNumber64"
							},
							fieldObject: {
								$ref: "#/definitions/IFieldObject"
							},
							fieldRange: {
								$ref: "#/definitions/IFieldRange"
							},
							fieldString: {
								$ref: "#/definitions/IFieldString"
							},
							fieldType: {
								$ref: "#/definitions/IFieldType"
							},
							number64: {
								$ref: "#/definitions/Number64"
							},
							range: {
								$ref: "#/definitions/Range"
							}
						},
						required: [
							"number64",
							"range",
							"dataset",
							"fieldType",
							"fieldBoolean",
							"fieldNumber",
							"fieldNumber64",
							"fieldString",
							"fieldRange",
							"fieldDataset",
							"fieldObject",
							"field"
						],
						type: "object"
					},
					transformationTypes: {
						additionalProperties: false,
						properties: {
							calculated: {
								$ref: "#/definitions/ICalculated"
							},
							equals: {
								$ref: "#/definitions/IEquals"
							},
							map: {
								$ref: "#/definitions/IMap"
							},
							multi: {
								$ref: "#/definitions/IMulti"
							},
							scale: {
								$ref: "#/definitions/IScale"
							},
							template: {
								$ref: "#/definitions/ITemplate"
							}
						},
						required: [
							"equals",
							"calculated",
							"scale",
							"template",
							"map",
							"multi"
						],
						type: "object"
					}
				},
				required: [
					"fieldTypes",
					"datasourceTypes",
					"datasourceRefTypes",
					"activityTypes",
					"aggregateTypes",
					"transformationTypes"
				],
				type: "object"
			},
			hipieProperties: {
				$ref: "#/definitions/IProperties"
			},
			properties: {
				$ref: "#/definitions/IProperties"
			},
			version: {
				"enum": [
					"2.0.23"
				],
				type: "string"
			}
		},
		required: [
			"version",
			"createdBy",
			"datasources",
			"dataviews"
		],
		type: "object"
	},
	VisibilityType: {
		"enum": [
			"normal",
			"flyout"
		],
		type: "string"
	}
};
var v2 = {
	$ref: $ref,
	$schema: $schema,
	definitions: definitions
};

var ddl2Schema = /*#__PURE__*/Object.freeze({
  $ref: $ref,
  $schema: $schema,
  definitions: definitions,
  'default': v2
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var PKG_NAME = "@hpcc-js/ddl-shim";
var PKG_VERSION = "2.14.0";

function isWorkunitDatasource(ref) {
    return ref.WUID !== undefined;
}
function isDatabombDatasource(ref) {
    return ref.databomb === true;
}
function isHipieDatasource(ref) {
    return ref.URL !== undefined;
}
function isPieVisualization(viz) {
    return viz.type === "PIE" || viz.type === "BAR";
}
function isLineVisualization(viz) {
    return viz.type === "LINE";
}
function isChoroVisualization(viz) {
    return viz.type === "CHORO";
}
function isTableVisualization(viz) {
    return viz.type === "TABLE";
}
function isSliderVisualization(viz) {
    return viz.type === "SLIDER";
}
function isGraphVisualization(viz) {
    return viz.type === "GRAPH";
}
function isFormVisualization(viz) {
    return viz.type === "FORM";
}

function isRoxieServiceRef(ref) {
    return ref.request !== undefined;
}

var classMappings = {
    c3chart_Bar: "chart_Bar",
    c3chart_Column: "chart_Column",
    c3chart_Pie: "chart_Pie",
    c3chart_Area: "chart_Area",
    c3chart_Line: "chart_Line",
    amchart_Bar: "chart_Bar",
    amchart_Column: "chart_Column",
    amchart_Pie: "chart_Pie",
    amchart_Area: "chart_Area",
    amchart_Line: "chart_Line",
    google_Bar: "chart_Bar",
    google_Column: "chart_Column",
    google_Pie: "chart_Pie",
    google_Area: "chart_Area",
    google_Line: "chart_Line",
    other_Table: "dgrid_Table"
};
var propertyMappings = {
    xAxisLabelRotation: [
        { name: "xAxisOverlapMode", transform: function (n) { return "rotate"; } },
        { name: "xAxisLabelRotation", transform: function (n) { return n; } }
    ],
    tooltipLabelColor: {
        name: "tooltipLabelColor"
    },
    tooltipSeriesColor: {
        name: "tooltipSeriesColor"
    },
    tooltipValueColor: {
        name: "tooltipValueColor"
    },
    tooltipValueFormat: {
        name: "tooltipValueFormat"
    },
    timePattern: {
        name: "xAxisTypeTimePattern"
    },
    smoothLines: {
        name: "interpolate",
        transform: function (n) {
            if (n === false)
                return "linear";
            return "catmullRom";
        }
    },
    holePercent: {
        name: "innerRadius"
    },
    flip: {
        name: "orientation",
        transform: function (n) { return n ? "vertical" : "horizontal"; }
    },
    bottomText: {
        name: "xAxisTitle"
    },
    xAxisTypeTimePattern: {
        name: "xAxisTypeTimePattern"
    },
    yAxisTypeTimePattern: {
        name: "yAxisTypeTimePattern"
    },
    valueFormat: {
        name: "tooltipValueFormat"
    },
    stacked: {
        name: "yAxisStacked"
    },
    showYGrid: {
        name: "yAxisGuideLines"
    },
    showXGrid: {
        name: "xAxisGuideLines"
    },
    showValueLabel: {
        name: "showValue"
    },
    low: {
        name: "yAxisDomainLow"
    },
    high: {
        name: "yAxisDomainHigh"
    },
    fillOpacity: {
        name: "interpolateFillOpacity"
    },
    areaFillOpacity: {
        name: "interpolateFillOpacity"
    },
    showToolbar: {
        name: "titleVisible"
    },
    showCSV: {
        name: "downloadButtonVisible"
    }
};
function findKeyVal(object, key, val) {
    var value;
    for (var k in object) {
        if (k === key && object[k] === val) {
            value = object;
            break;
        }
        if (object[k] && typeof object[k] === "object") {
            value = findKeyVal(object[k], key, val);
            if (value !== undefined) {
                break;
            }
        }
    }
    return value;
}
function apply_to_dataviews(ddl2, dermObj) {
    ddl2.dataviews.forEach(apply_to_dataview);
    function apply_to_dataview(dv) {
        var widgetId = dv.id;
        var dermPanelObj = findKeyVal(dermObj, "__id", widgetId);
        if (dermPanelObj) {
            var dermPanelProps = dermPanelObj.__properties;
            var dermWidgetObj = dermPanelObj.__properties.chart ? dermPanelObj.__properties.chart : dermPanelObj.__properties.widget;
            var dermWidgetProps = dermWidgetObj.__properties;
            apply_class_mapping(dermWidgetObj);
            apply_panel_property_mapping(dermPanelProps, dermWidgetProps);
            apply_widget_property_mapping(dermPanelProps, dermWidgetProps);
            if (dv.visualization.properties.chartType) {
                dv.visualization.properties.charttype = dv.visualization.properties.chartType;
            }
        }
        else {
            console.warn(widgetId + " not found in dermObj");
        }
        function apply_class_mapping(dermWidgetObj) {
            dv.visualization.__class = swap_with_supported_class(dermWidgetObj.__class);
            dv.visualization.properties.__class = "marshaller_VizChartPanel";
            if (!dv.visualization.properties.widget)
                dv.visualization.properties.widget = {};
            dv.visualization.properties.widget.__class = dv.visualization.__class;
            function swap_with_supported_class(_class) {
                return classMappings[_class] ? classMappings[_class] : _class;
            }
        }
        function apply_panel_property_mapping(dermPanelProps, dermWidgetProps) {
            dv.visualization.title = dermPanelProps.title || "";
            dv.visualization.description = "";
            dv.visualization.visibility = dv.visualization.visibility === "flyout" ? "flyout" : "normal";
            dv.visualization.chartType = dv.visualization.__class.split("_")[1];
            for (var propName in dermPanelProps) {
                if (typeof propertyMappings[propName] !== "undefined") {
                    var newPropName = propertyMappings[propName].name;
                    if (typeof propertyMappings[propName].transform === "function") {
                        dv.visualization.properties[newPropName] = propertyMappings[propName].transform(dermPanelProps[propName]);
                    }
                    else {
                        dv.visualization.properties[newPropName] = dermPanelProps[propName];
                    }
                }
            }
            if (dermWidgetProps && dermWidgetProps.showLegend && dv.visualization.properties) {
                dv.visualization.properties.legendVisible = true;
            }
        }
        function apply_widget_property_mapping(dermPanelProps, dermWidgetProps) {
            dv.visualization.title = dv.visualization.title || dermWidgetProps.title || "";
            dv.visualization.description = ""; // TODO - should this map to anything?
            dv.visualization.visibility = dv.visualization.visibility === "flyout" ? "flyout" : "normal";
            dv.visualization.chartType = dv.visualization.__class.split("_")[1];
            var _loop_1 = function (propName) {
                if (typeof propertyMappings[propName] !== "undefined") {
                    if (propertyMappings[propName] instanceof Array) {
                        propertyMappings[propName].forEach(function (p) {
                            var newPropName = p.name;
                            dv.visualization.properties.widget[newPropName] = p.transform(dermWidgetProps[propName]);
                            if (typeof propertyMappings[propName].transform === "function") {
                                dv.visualization.properties.widget[newPropName] = propertyMappings[propName].transform(dermWidgetProps[propName]);
                            }
                            else {
                                dv.visualization.properties.widget[newPropName] = dermWidgetProps[propName];
                            }
                        });
                    }
                    else {
                        var newPropName = propertyMappings[propName].name;
                        dv.visualization.properties.widget[newPropName] = propertyMappings[propName].transform(dermWidgetProps[propName]);
                    }
                }
            };
            for (var propName in dermWidgetProps) {
                _loop_1(propName);
            }
        }
    }
}
function apply_to_properties_layout(ddl2, dermObj) {
    var retVal = {
        layout: []
    };
    if (!dermObj || !dermObj.__properties)
        return;
    dermObj.__properties.content.forEach(function (cell) {
        var cellPosition = {
            // TODO - if "id" could be avoided then layouts could apply to any dashboard with the same number of widgets
            id: cell.__properties.widget.__id,
            position: [
                cell.__properties.gridCol,
                cell.__properties.gridRow,
                cell.__properties.gridColSpan,
                cell.__properties.gridRowSpan
            ]
        };
        retVal.layout.push(cellPosition);
    });
    return retVal;
}
function upgrade(ddl2, dermObj) {
    apply_to_dataviews(ddl2, dermObj);
    return apply_to_properties_layout(ddl2, dermObj);
}

function faCharFix(faChar) {
    return faChar;
}
var DDLUpgrade = /** @class */ (function () {
    function DDLUpgrade(ddl, baseUrl, wuid, toLowerCase) {
        if (baseUrl === void 0) { baseUrl = "http://localhost:8010"; }
        if (wuid === void 0) { wuid = "WUID"; }
        if (toLowerCase === void 0) { toLowerCase = true; }
        this._datasources = {};
        this._datasourceUpdates = {};
        this._visualizations = {};
        this._ddl2Datasources = {};
        this._ddl2DatasourceFields = {};
        this._ddl2Dataviews = {};
        this._ddl2DataviewActivities = {};
        this._ddl = ddl;
        this._baseUrl = baseUrl;
        this._wuid = wuid;
        this._toLowerCase = toLowerCase;
        this.indexDDL();
        this.readDDL();
    }
    DDLUpgrade.prototype.toLowerCase = function (s) {
        return this._toLowerCase ? s.toLowerCase() : s;
    };
    DDLUpgrade.prototype.isVizDatasourceRoxie = function (viz) {
        if (viz.source) {
            var ds = this._datasources[viz.source.id];
            if (isHipieDatasource(ds)) {
                return true;
            }
        }
        return false;
    };
    DDLUpgrade.prototype.getDatasourceOutputs = function (dsID, vizID) {
        var retVal = [];
        var datasource = this._datasources[dsID];
        for (var _i = 0, _a = datasource.outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.notify) {
                for (var _b = 0, _c = output.notify; _b < _c.length; _b++) {
                    var notify = _c[_b];
                    if (notify === vizID) {
                        retVal.push({
                            datasource: datasource,
                            output: output
                        });
                    }
                }
            }
        }
        return retVal;
    };
    DDLUpgrade.prototype.getDatasourceFilters = function (dsID, vizID) {
        var retVal = {};
        for (var _i = 0, _a = this.getDatasourceOutputs(dsID, vizID); _i < _a.length; _i++) {
            var dsOut = _a[_i];
            if (dsOut.output.filter) {
                for (var _b = 0, _c = dsOut.output.filter; _b < _c.length; _b++) {
                    var filter = _c[_b];
                    retVal[filter.fieldid] = {
                        datasource: dsOut.datasource,
                        output: dsOut.output,
                        filter: filter
                    };
                }
            }
        }
        return retVal;
    };
    DDLUpgrade.prototype.indexDDL = function () {
        for (var _i = 0, _a = this._ddl.dashboards; _i < _a.length; _i++) {
            var dash = _a[_i];
            for (var _b = 0, _c = dash.visualizations; _b < _c.length; _b++) {
                var viz = _c[_b];
                this._visualizations[viz.id] = viz;
            }
        }
        for (var _d = 0, _e = this._ddl.datasources; _d < _e.length; _d++) {
            var ds = _e[_d];
            this._datasources[ds.id] = ds;
            for (var _f = 0, _g = ds.outputs; _f < _g.length; _f++) {
                var output = _g[_f];
                if (output.notify) {
                    for (var _h = 0, _j = output.notify; _h < _j.length; _h++) {
                        var notify = _j[_h];
                        this._datasourceUpdates[notify] = {
                            id: ds.id,
                            output: output.from || output.id
                        };
                    }
                }
            }
        }
    };
    DDLUpgrade.prototype.readDDL = function () {
        for (var _i = 0, _a = this._ddl.datasources; _i < _a.length; _i++) {
            var ds = _a[_i];
            if (isWorkunitDatasource(ds)) {
                var ddl2DS = {
                    type: "wuresult",
                    id: ds.id,
                    url: this._baseUrl,
                    wuid: this._wuid,
                    outputs: {}
                };
                for (var _b = 0, _c = ds.outputs; _b < _c.length; _b++) {
                    var output = _c[_b];
                    this.output2output(output, ddl2DS.outputs);
                }
                this._ddl2Datasources[ds.id] = ddl2DS;
            }
            else if (isDatabombDatasource(ds)) ;
            else {
                var urlParts = ds.URL.split("/WsEcl/submit/query/");
                var hostParts = urlParts[0];
                var roxieParts = urlParts[1].split("/");
                var ddl2DS = {
                    type: "hipie",
                    id: ds.id,
                    url: hostParts,
                    querySet: roxieParts[0],
                    queryID: roxieParts[1],
                    inputs: [],
                    outputs: {}
                };
                for (var _d = 0, _e = ds.outputs; _d < _e.length; _d++) {
                    var output = _e[_d];
                    this.output2output(output, ddl2DS.outputs);
                }
                this._ddl2Datasources[ds.id] = ddl2DS;
            }
        }
        for (var _f = 0, _g = this._ddl.dashboards; _f < _g.length; _f++) {
            var dash = _g[_f];
            for (var _h = 0, _j = dash.visualizations; _h < _j.length; _h++) {
                var viz = _j[_h];
                if (viz.type === "FORM") {
                    this._ddl2Datasources[viz.id] = {
                        type: "form",
                        id: viz.id,
                        fields: this.formFields2field(viz.fields)
                    };
                    this._datasourceUpdates[viz.id] = { id: viz.id };
                }
                else if (viz.type === "SLIDER") {
                    this._ddl2Datasources[viz.id] = {
                        type: "form",
                        id: viz.id,
                        fields: this.formFields2field(viz.fields, true)
                    };
                    this._datasourceUpdates[viz.id] = { id: viz.id };
                }
                this._ddl2Dataviews[viz.id] = this.anyViz2view(viz);
            }
        }
        this.readGroupBy();
        this.readFilters();
        this.readSort();
        this.readMappings();
    };
    DDLUpgrade.prototype.readGroupBy = function () {
        for (var _i = 0, _a = this._ddl.dashboards; _i < _a.length; _i++) {
            var dash = _a[_i];
            for (var _b = 0, _c = dash.visualizations; _b < _c.length; _b++) {
                var viz = _c[_b];
                if (viz.fields) {
                    var projectTransformations = [];
                    var groupByColumns = [];
                    var aggrFields = [];
                    for (var _d = 0, _e = viz.fields; _d < _e.length; _d++) {
                        var field = _e[_d];
                        if (field.properties && field.properties.function) {
                            switch (field.properties.function) {
                                case "SUM":
                                case "MIN":
                                case "MAX":
                                    aggrFields.push({
                                        type: this.func2aggr(field.properties.function),
                                        inFieldID: this.toLowerCase(field.properties.params.param1),
                                        fieldID: this.toLowerCase(field.id)
                                    });
                                    break;
                                case "AVE":
                                    aggrFields.push({
                                        type: this.func2aggr(field.properties.function),
                                        inFieldID: this.toLowerCase(field.properties.params.param1),
                                        baseCountFieldID: field.properties.params.param2 ? this.toLowerCase(field.properties.params.param2) : undefined,
                                        fieldID: this.toLowerCase(field.id)
                                    });
                                    break;
                                case "SCALE":
                                    if (typeof field.properties.params.param1 === "object") {
                                        var props = field.properties.params.param1;
                                        switch (props.function) {
                                            case "SUM":
                                            case "MIN":
                                            case "MAX":
                                                aggrFields.push({
                                                    type: this.func2aggr(props.function),
                                                    inFieldID: this.toLowerCase(props.params.param1),
                                                    fieldID: this.toLowerCase(field.id)
                                                });
                                                break;
                                        }
                                    }
                                    projectTransformations.push({
                                        type: "scale",
                                        sourceFieldID: this.toLowerCase(field.id),
                                        fieldID: this.toLowerCase(field.id),
                                        factor: +field.properties.params.param2
                                    });
                                    break;
                                default:
                                    groupByColumns.push(this.toLowerCase(field.id));
                                    throw new Error("Unhandled field function: " + field.properties.function);
                            }
                        }
                        else {
                            groupByColumns.push(this.toLowerCase(field.id));
                        }
                    }
                    if (projectTransformations.length) {
                        this._ddl2DataviewActivities[viz.id].project.transformations = projectTransformations;
                    }
                    if (aggrFields.length) {
                        this._ddl2DataviewActivities[viz.id].groupBy.groupByIDs = groupByColumns.slice();
                        this._ddl2DataviewActivities[viz.id].groupBy.aggregates = aggrFields;
                    }
                }
            }
        }
    };
    DDLUpgrade.prototype.func2aggr = function (func) {
        switch (func) {
            case "SUM":
                return "sum";
            case "AVE":
                return "mean";
            case "MIN":
                return "min";
            case "MAX":
                return "max";
        }
        throw new Error("Unknown DDL1 Function Type:  " + func);
    };
    DDLUpgrade.prototype.readMappings = function () {
        for (var _i = 0, _a = this._ddl.dashboards; _i < _a.length; _i++) {
            var dash = _a[_i];
            for (var _b = 0, _c = dash.visualizations; _b < _c.length; _b++) {
                var viz = _c[_b];
                if (isFormVisualization(viz)) ;
                else if (isPieVisualization(viz)) {
                    this.readPieMappings(viz);
                }
                else if (isChoroVisualization(viz)) {
                    this.readChoroMappings(viz);
                }
                else if (isLineVisualization(viz)) {
                    this.readLineMappings(viz);
                }
                else if (isTableVisualization(viz)) {
                    this.readTableMappings(viz);
                }
                else if (isGraphVisualization(viz)) {
                    this.readGraphMappings(viz);
                }
                else if (isSliderVisualization(viz)) {
                    this.readSliderMappings(viz);
                }
                else {
                    throw new Error("Unkown DDL1 mapping type:  " + viz.type);
                }
            }
        }
    };
    DDLUpgrade.prototype.readPieMappings = function (viz) {
        var mappings = this._ddl2DataviewActivities[viz.id].mappings;
        mappings.transformations.push({
            fieldID: "label",
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.mappings.label)
        });
        mappings.transformations.push({
            fieldID: "weight",
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.mappings.weight[0])
        });
    };
    DDLUpgrade.prototype.readChoroMappings = function (viz) {
        var mappings = this._ddl2DataviewActivities[viz.id].mappings;
        mappings.transformations.push({
            fieldID: "label",
            type: "=",
            sourceFieldID: this.toLowerCase(this.anyChoroMapping2label(viz.source.mappings))
        });
        mappings.transformations.push({
            fieldID: "weight",
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.mappings.weight[0])
        });
    };
    DDLUpgrade.prototype.anyChoroMapping2label = function (mapping) {
        return mapping.state || mapping.county || mapping.geohash;
    };
    DDLUpgrade.prototype.readLineMappings = function (viz) {
        var mappings = this._ddl2DataviewActivities[viz.id].mappings;
        mappings.transformations.push({
            fieldID: viz.source.mappings.x[0],
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.mappings.x[0])
        });
        for (var i = 0; i < viz.source.mappings.y.length; ++i) {
            mappings.transformations.push({
                fieldID: viz.source.mappings.y[i],
                type: "=",
                sourceFieldID: this.toLowerCase(viz.source.mappings.y[i])
            });
        }
    };
    DDLUpgrade.prototype.readTableMappings = function (viz) {
        var mappings = this._ddl2DataviewActivities[viz.id].mappings;
        for (var i = 0; i < viz.label.length; ++i) {
            mappings.transformations.push({
                fieldID: viz.label[i],
                type: "=",
                sourceFieldID: this.toLowerCase(viz.source.mappings.value[i])
            });
        }
    };
    DDLUpgrade.prototype.readGraphEnums = function (valueMappings, annotation) {
        if (annotation === void 0) { annotation = false; }
        var retVal = [];
        if (valueMappings) {
            for (var value in valueMappings) {
                var newValue = {};
                for (var key in valueMappings[value]) {
                    if (key === "faChar") {
                        newValue[key] = faCharFix(valueMappings[value][key]);
                    }
                    else if (annotation && key.indexOf("icon_") === 0) {
                        console.log("Deprecated flag property:  " + key);
                        newValue[key.split("icon_")[1]] = valueMappings[value][key];
                    }
                    else {
                        newValue[key] = valueMappings[value][key];
                    }
                }
                //  remove v1.x "0" annotations as they equated to "nothing"  ---
                if (!annotation || value !== "0") {
                    retVal.push({
                        value: value,
                        newValue: newValue
                    });
                }
            }
        }
        return retVal;
    };
    DDLUpgrade.prototype.readGraphMappings = function (viz) {
        var mappings = this._ddl2DataviewActivities[viz.id].mappings;
        mappings.transformations.push({
            fieldID: "uid",
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.mappings.uid)
        });
        mappings.transformations.push({
            fieldID: "label",
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.mappings.label)
        });
        if (viz.icon.fieldid) {
            mappings.transformations.push({
                fieldID: "icon",
                type: "map",
                sourceFieldID: this.toLowerCase(viz.icon.fieldid),
                default: { fachar: faCharFix(viz.icon.faChar) },
                mappings: this.readGraphEnums(viz.icon.valuemappings)
            });
        }
        var idx = 0;
        if (viz.flag) {
            for (var _i = 0, _a = viz.flag; _i < _a.length; _i++) {
                var flag = _a[_i];
                if (flag.fieldid) {
                    mappings.transformations.push({
                        fieldID: "annotation_" + idx++,
                        type: "map",
                        sourceFieldID: this.toLowerCase(flag.fieldid),
                        default: {},
                        mappings: this.readGraphEnums(flag.valuemappings, true)
                    });
                }
            }
        }
        mappings.transformations.push({
            fieldID: "links",
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.link.childfile),
            transformations: [{
                    fieldID: "uid",
                    type: "=",
                    sourceFieldID: this.toLowerCase(viz.source.link.mappings.uid)
                }]
        });
    };
    DDLUpgrade.prototype.readSliderMappings = function (viz) {
        var mappings = this._ddl2DataviewActivities[viz.id].mappings;
        mappings.transformations.push({
            fieldID: "label",
            type: "=",
            sourceFieldID: this.toLowerCase(viz.source.mappings.label)
        });
    };
    DDLUpgrade.prototype.readFilters = function () {
        for (var _i = 0, _a = this._ddl.dashboards; _i < _a.length; _i++) {
            var dash = _a[_i];
            for (var _b = 0, _c = dash.visualizations; _b < _c.length; _b++) {
                var viz = _c[_b];
                if (viz.events) {
                    for (var eventID in viz.events) {
                        var event_1 = viz.events[eventID];
                        for (var _d = 0, _e = event_1.updates; _d < _e.length; _d++) {
                            var update = _e[_d];
                            var otherViz = this._ddl2Dataviews[update.visualization];
                            var dsFilters = this.getDatasourceFilters(update.datasource, otherViz.id);
                            if (update.mappings) {
                                if (isRoxieServiceRef(otherViz.datasource)) {
                                    for (var key in update.mappings) {
                                        otherViz.datasource.request.push({
                                            source: viz.id,
                                            remoteFieldID: this.toLowerCase(key),
                                            localFieldID: this.toLowerCase(update.mappings[key])
                                        });
                                    }
                                }
                                else {
                                    var condition = {
                                        viewID: viz.id,
                                        mappings: []
                                    };
                                    for (var key in update.mappings) {
                                        var mapping = update.mappings[key];
                                        var dsFilter = mapping ? dsFilters[mapping].filter : undefined;
                                        if (!dsFilter) {
                                            console.log("Select Mapping " + mapping + " in viz " + viz.id + " not found in filters for " + otherViz.id);
                                        }
                                        else {
                                            condition.mappings.push({
                                                remoteFieldID: this.toLowerCase(key),
                                                localFieldID: this.toLowerCase(update.mappings[key]),
                                                condition: this.rule2condition(dsFilter.rule),
                                                nullable: dsFilter.nullable
                                            });
                                        }
                                    }
                                    this._ddl2DataviewActivities[otherViz.id].filters.conditions.push(condition);
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    DDLUpgrade.prototype.rule2condition = function (_) {
        switch (_) {
            case "set":
                return "in";
            case "notequals":
                return "!=";
        }
        return _;
    };
    DDLUpgrade.prototype.readSort = function () {
        var _this = this;
        for (var _i = 0, _a = this._ddl.dashboards; _i < _a.length; _i++) {
            var dash = _a[_i];
            for (var _b = 0, _c = dash.visualizations; _b < _c.length; _b++) {
                var viz = _c[_b];
                if (viz.source) {
                    if (viz.source.sort) {
                        var vizSort = this._ddl2DataviewActivities[viz.id].sort;
                        vizSort.conditions = viz.source.sort.map(function (s) {
                            if (s.indexOf("-") === 0) {
                                return {
                                    fieldID: _this.toLowerCase(s.substr(1)),
                                    descending: true
                                };
                            }
                            return {
                                fieldID: _this.toLowerCase(s),
                                descending: false
                            };
                        });
                    }
                    if (viz.source.first) {
                        var vizLimit = this._ddl2DataviewActivities[viz.id].limit;
                        vizLimit.limit = +viz.source.first;
                    }
                }
            }
        }
    };
    DDLUpgrade.prototype.anyViz2view = function (viz) {
        var project = {
            type: "project",
            transformations: []
        };
        var filters = {
            type: "filter",
            conditions: []
        };
        var groupBy = {
            type: "groupby",
            groupByIDs: [],
            aggregates: []
        };
        var sort = {
            type: "sort",
            conditions: []
        };
        var limit = {
            type: "limit",
            limit: 0
        };
        var mappings = {
            type: "mappings",
            transformations: []
        };
        this._ddl2DataviewActivities[viz.id] = {
            project: project,
            filters: filters,
            sort: sort,
            groupBy: groupBy,
            limit: limit,
            mappings: mappings
        };
        var datasourceRef = this.isVizDatasourceRoxie(viz) ? {
            id: this._datasourceUpdates[viz.id].id,
            request: [],
            output: this._datasourceUpdates[viz.id].output
        } : {
            id: this._datasourceUpdates[viz.id].id,
            output: this._datasourceUpdates[viz.id].output
        };
        return {
            id: viz.id,
            datasource: datasourceRef,
            activities: [
                project,
                filters,
                sort,
                groupBy,
                limit
            ],
            visualization: __assign({ id: viz.id, title: viz.title || "", description: "", visibility: viz.properties && viz.properties.flyout === true ? "flyout" : "normal" }, this.type2chartType(viz.type), { mappings: mappings, properties: (viz.properties || {}) })
        };
    };
    DDLUpgrade.prototype.type2chartType = function (chartType) {
        switch (chartType) {
            case "LINE":
                return { chartType: "Line", __class: "chart_Line" };
            case "BUBBLE":
                return { chartType: "Bubble", __class: "chart_Bubble" };
            case "PIE":
                return { chartType: "Pie", __class: "chart_Pie" };
            case "BAR":
                return { chartType: "Column", __class: "chart_Column" };
            case "FORM":
                return { chartType: "FieldForm", __class: "form_FieldForm" };
            case "WORD_CLOUD":
                return { chartType: "WordCloud", __class: "chart_WordCloud" };
            case "CHORO":
                return { chartType: "ChoroplethStates", __class: "map_ChoroplethStates" };
            case "SUMMARY":
                return { chartType: "Summary", __class: "chart_Summary" };
            case "SLIDER":
                return { chartType: "FieldForm", __class: "form_FieldForm" };
            case "HEAT_MAP":
                return { chartType: "HeatMap", __class: "other_HeatMap" };
            case "2DCHART":
                return { chartType: "Column", __class: "chart_Column" };
            case "GRAPH":
                return { chartType: "AdjacencyGraph", __class: "graph_AdjacencyGraph" };
            case "TABLE":
            default:
                return { chartType: "Table", __class: "dgrid_Table" };
        }
    };
    DDLUpgrade.prototype.formFields2field = function (fields, slider) {
        var _this = this;
        if (slider === void 0) { slider = false; }
        if (!fields)
            return [];
        return fields.map(function (field) {
            switch (field.properties.type) {
                case "range":
                    return {
                        type: "range",
                        id: field.id,
                        default: (field.properties.default ? field.properties.default : undefined)
                    };
                case "dataset":
                    return {
                        type: "dataset",
                        id: field.id,
                        default: [],
                        children: []
                    };
                default:
                    return {
                        type: _this.formFieldType2fieldType(field.properties.datatype, slider),
                        id: field.id,
                        default: field.properties.default ? field.properties.default[0] : undefined
                    };
            }
        });
    };
    DDLUpgrade.prototype.formFieldType2fieldType = function (fieldType, slider) {
        switch (fieldType) {
            case "bool":
            case "boolean":
                return "boolean";
            case "integer":
            case "unsigned":
            case "float":
            case "double":
            case "real":
                return "number";
            case "string":
                return "string";
            default:
                return slider ? "number" : "string";
        }
    };
    DDLUpgrade.prototype.output2output = function (output, target) {
        target[output.from || output.id] = {
            fields: this.filters2fields(output.filter)
        };
    };
    DDLUpgrade.prototype.filters2fields = function (filters) {
        if (!filters)
            return [];
        return filters.filter(function (filter) {
            var idParts = filter.fieldid.split("-");
            return idParts.length === 1 || idParts[1] === "range";
        }).map(function (filter) {
            var idParts = filter.fieldid.split("-");
            var retVal = {
                type: "string",
                id: idParts[0]
            };
            return retVal;
        });
    };
    DDLUpgrade.prototype.getVizField = function (vizID, fieldID) {
        return {
            type: "string",
            id: "",
            default: ""
        };
    };
    DDLUpgrade.prototype.writeDatasources = function () {
        var retVal = [];
        for (var id in this._ddl2Datasources) {
            retVal.push(this._ddl2Datasources[id]);
        }
        return retVal;
    };
    DDLUpgrade.prototype.writeDataviews = function () {
        var retVal = [];
        for (var id in this._ddl2Dataviews) {
            retVal.push(this._ddl2Dataviews[id]);
        }
        return retVal;
    };
    DDLUpgrade.prototype.writeProperties = function () {
        return {
        //  TODO
        };
    };
    DDLUpgrade.prototype.write = function () {
        return {
            version: "2.0.23",
            createdBy: {
                name: PKG_NAME,
                version: PKG_VERSION
            },
            datasources: this.writeDatasources(),
            dataviews: this.writeDataviews(),
            properties: this.writeProperties()
        };
    };
    return DDLUpgrade;
}());
function upgrade$1(ddl, baseUrl, wuid, toLowerCase, dermatologyJson) {
    if (toLowerCase === void 0) { toLowerCase = true; }
    if (dermatologyJson === void 0) { dermatologyJson = {}; }
    var ddlUp = new DDLUpgrade(ddl, baseUrl, wuid, toLowerCase);
    var retVal = ddlUp.write();
    retVal.properties = upgrade(retVal, dermatologyJson);
    return retVal;
}

var args = process.argv.slice(2);
switch (args[0]) {
    case "--echo":
        process.stdout.write(args[1]);
        break;
    case "--schema":
        process.stdout.write(JSON.stringify(ddl2Schema));
        break;
    case "--upgrade":
    case "--upgradeNoLower":
        var srcPath = args[1];
        var destPath_1 = args[2];
        var baseUrl_1 = args[3];
        var wuid_1 = args[4];
        var layoutPath = args[5];
        if (srcPath && destPath_1 && srcPath !== destPath_1) {
            var layoutJson_1 = {};
            if (layoutPath) {
                try {
                    layoutJson_1 = JSON.parse(fs.readFileSync(layoutPath).toString());
                }
                catch (e) {
                    console.error(e);
                }
            }
            fs.readFile(srcPath, "utf8", function (err, data) {
                if (err)
                    throw err;
                var ddl2 = upgrade$1(JSON.parse(data), baseUrl_1 || "http://localhost:8010", wuid_1 || "WUID", args[0] === "--upgrade", layoutJson_1);
                fs.writeFile(destPath_1, JSON.stringify(ddl2), function (err) {
                    if (err)
                        throw err;
                    console.log("complete");
                });
            });
        }
        break;
    case "--help":
        break;
    default:
        process.stdout.write("\nUsage:  <command>\n\nwhere <command> is one of:\n    --schema:  output DDL2 schmea.\n    --upgrade ddl1 [baseUrl wuid [layout]]:  updgrade ddl and layout version 1 to ddl version 2.\n    --upgradeNoLower ddl1 [baseUrl wuid [layout]]:  updgrade ddl and layout version 1 to ddl version 2 without changing field IDs upper/lower casing.\n    --help:  this message.\n");
}
//# sourceMappingURL=cli.js.map