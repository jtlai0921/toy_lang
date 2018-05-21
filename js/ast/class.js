import {Instance} from "./value.js";
import {Apply} from "./function.js";
export {Instalization, Property};

class Instalization {
    constructor(fVariable, args) {
        this.apply = new Apply(fVariable, args);
    } 

    evaluate(context) {
        return new Instance(this.apply.evaluate(context).variables);
    }   
}

class Property {
    constructor(receiver, name) {
        this.receiver = receiver;
        this.name = name;
    }

    getter() {
        return new PropertyGetter(this);
    }
}

class PropertyGetter {
    constructor(property) {
        this.property = property;
    }

    evaluate(context) {
        return this.property.receiver.evaluate(context).getProperty(this.property.name);
    }    
}