import "reflect-metadata";

const deserializationKey = "deserializable-properties";
const serializeKey = "serializable-property";

export function serializable(identifier?: string) {
    return (target: any, key: string) => {
        const jsonKey = identifier || key;
        Reflect.defineMetadata(serializeKey, jsonKey, target, key);

        const deserializationMap: { [key: string]: any } = Reflect.getMetadata(deserializationKey, target) || {};
        deserializationMap[jsonKey] = key;
        Reflect.defineMetadata(deserializationKey, deserializationMap, target);
    };
}

export function serialize(obj: any) {
    if (obj instanceof Array) {
        return obj.map(o => serialize(o));
    } else if (obj instanceof Object) {
        let hasSerializable = false;
        const result: { [key: string]: any } = {
            type: (obj.constructor as any).name
        };
        Object.keys(obj).forEach((key: string) => {
            const identifier: string = Reflect.getMetadata(serializeKey, obj, key);
            if (identifier) {
                const value = (obj as any)[key];
                result[identifier] = serialize(value);
                hasSerializable = true;
            }
        });
        return hasSerializable ? result : obj;
    }
    return obj;
}

export function deserialize(source: any, factory: (classID: string) => any) {
    if (source instanceof Array) {
        return source.map(s => deserialize(s, factory));
    } else if (source instanceof Object) {
        const obj = factory(source.type);
        if (obj) {
            const map: any = Reflect.getMetadata(deserializationKey, obj);
            for (const propName in map) {
                const jsonKey = map[propName];
                const value = source[jsonKey];
                if (!value && !(jsonKey in source)) {
                    throw new TypeError(`${propName} must be provided when deserializing ${(obj.constructor as any).name}`);
                }
                (obj as any)[propName] = deserialize(value, factory);
            }
            return obj;
        }
        return source;
    }
    return source;
}
