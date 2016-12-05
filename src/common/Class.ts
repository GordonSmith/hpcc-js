export class Class {
    static _class = "common_Class";

    protected classDeclaration() {
        return Object.getPrototypeOf(this).constructor;
    };

    protected superDeclaration() {
        return Object.getPrototypeOf(this);
    }

    class() {
        let retVal = [this.classID()];
        let parent = this.superDeclaration();
        let id = parent.id();
        while (parent && parent.classID) {
            let classID = parent.classID();
            if (!classID) {
                break;
            }
            retVal.push(classID);
            parent = parent.superDeclaration();
        }
        return retVal.reverse().join(" ");
    };

    private legacyClassID() {
        //  TODO Remove after TSC transition        
        let classDec = this.classDeclaration();
        return classDec.prototype._class ? classDec.prototype._class.split(" ").pop() : "";
    }

    classID() {
        let classDec = this.classDeclaration();
        return classDec._class || this.legacyClassID();
    };

    implements(source) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                if (this[prop] === undefined) {
                    this[prop] = source[prop];
                } else if ((window as any).__hpcc_debug) {
                    console.log("Duplicate member:  " + prop);
                }
            }
        }
    };

    mixin(mixinClass) {
        this.implements(mixinClass.prototype);
        //  Special case mixins  ---
        if (mixinClass.prototype.hasOwnProperty("_class")) {
            //this._class += " " + mixinClass.prototype._class.split(" ").pop();
        }
    };

    overrideMethod(methodID, newMethod) {
        if (this[methodID] === undefined) {
            throw "Method:  " + methodID + " does not exist.";
        }
        var origMethod = this[methodID];
        this[methodID] = function () {
            return newMethod(origMethod, arguments);
        };
        return this;
    };
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}

/*
MyClass.prototype.test = function (_?) {
    if (!arguments.length) return 22;
    return this;
}
*/
