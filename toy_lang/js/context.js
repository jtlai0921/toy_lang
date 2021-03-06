import {BUILTIN_FUNCTIONS} from './builtin/functions.js';
import {BUILTIN_CLASSES} from './builtin/classes.js';
import {Instance} from './interpreter/ast/value.js';

export {Context};

const BUILTINS = new Map(
    Array.from(BUILTIN_FUNCTIONS.entries()).concat(
        Array.from(BUILTIN_CLASSES.entries())
    )
); 

let BUILTIN_MODULE_INSTANCE;

const RUNTIME_CHECKER = {
    refErrIfNoValue(v, name) {
        if(!v) {
            throw new ReferenceError(`${name} is not defined`);
        }
    },

    evalErrIfNoValue(v, message) {
        if(!v) {
            throw new EvalError(message);
        }
    }
};

function self(f) {
    return this;
}

function call(f) {
    return f(this);
}

function eitherRight(left, right) {
    return right(this);
}

function eitherLeft(left, right) {
    return left(this);
}

const defaultFlowConrtoller = {
    either : eitherRight,
    returnedValue : null,
    notReturn : call,
    thrownContext : null,
    thrownNode : null,
    notThrown : call,
    notBroken : call
};

function createFlowController({either, returnedValue, notReturn, thrownContext, thrownNode, notThrown, notBroken}) {
    return {
        either : either || defaultFlowConrtoller.either,
        returnedValue : returnedValue || defaultFlowConrtoller.returnedValue,
        notReturn : notReturn || defaultFlowConrtoller.notReturn,
        thrownContext : thrownContext || defaultFlowConrtoller.thrownContext,
        thrownNode : thrownNode || defaultFlowConrtoller.thrownNode,
        notThrown : notThrown || defaultFlowConrtoller.notThrown,
        notBroken : notBroken || defaultFlowConrtoller.notBroken
    };
}

function changeFlowController(ctx, option) {
    return new Context({
        fileName : ctx.fileName,
        lines : ctx.lines,
        parent : ctx.parent,
        variables : ctx.variables,
        flowController : createFlowController(option)
    });
}

let environment;
let unhandledExceptionHandler;

class Context { 
    constructor({fileName, lines, parent, variables, flowController}) {
        this.fileName = fileName;
        this.lines = lines;
        this.parent = parent || null;
        this.variables = variables || new Map();
        this.flowController = flowController || defaultFlowConrtoller;
    }

    static initialize(env, module) {
        if(!environment) {
            environment = env;
        }

        const context = new Context({
            fileName : module.fileName,
            lines : module.lines(),
            variables : new Map(BUILTINS)
        });

        const moduleInstance = new Instance(BUILTINS.get('Module'), context.variables, module);
        context.variables.set('this', moduleInstance);
        context.variables.set('builtin', BUILTIN_MODULE_INSTANCE);

        return context;
    }

    unhandledExceptionHandler(handler) {
        if(handler) {
            unhandledExceptionHandler = handler;
        }
        return unhandledExceptionHandler;
    }
    
    childContext() {
        return new Context({
            fileName : this.fileName,
            lines : this.lines,
            parent : this
        });
    }

    output(value) {
        environment.output(value);
        return this;
    }

    input(message) {
        return environment.input(message);
    }

    // For simple support for closure, the 'assign' method changes the state directly.
    assign(variable, value) {
        this.variables.set(variable, value);
        return this;
    }

    returned(value) {
        return changeFlowController(this, {returnedValue : value, notReturn : self});
    }

    thrown(thrownNode) {
        return changeFlowController(this, {
            either : eitherLeft,
            thrownContext : this,
            thrownNode : thrownNode,
            notThrown : self
        });
    }

    emptyThrown() {
        return changeFlowController(this, {thrownContext : this});
    }

    deleteVariable(name) {
        this.variables.delete(name);
        return this;
    }

    broken() {
        return changeFlowController(this, {notBroken : self});
    }

    fixBroken() {
        return changeFlowController(this, {notBroken : call});
    }

    lookUpVariable(name) {
        const value = this.variables.get(name);
        if(value !== undefined) {
            return value;
        }
        
        RUNTIME_CHECKER.refErrIfNoValue(this.parent, name);
        return this.parent.lookUpVariable(name);
    }   
    
    get RUNTIME_CHECKER() {
        return RUNTIME_CHECKER;
    }

    get either() {
        return this.flowController.either;
    }

    get returnedValue() {
        return this.flowController.returnedValue;
    }

    get notReturn() {
        return this.flowController.notReturn;
    }

    get thrownContext() {
        return this.flowController.thrownContext;
    }

    get thrownNode() {
        return this.flowController.thrownNode;
    }

    get notBroken() {
        return this.flowController.notBroken;
    }

    isBroken() {
        return this.flowController.notBroken === self;
    }

    get notThrown() {
        return this.flowController.notThrown;
    }

    static addToBuiltins(name, value) {
        BUILTINS.set(name, value);
    }

    static setBuiltinModule(moduleInstance) {
        BUILTIN_MODULE_INSTANCE = moduleInstance;
        moduleInstance.properties = BUILTINS;
    }
}
