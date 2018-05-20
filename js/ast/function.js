export {Return, Apply, FunCall, FunCallWrapper};

class Return {
    constructor(value) {
        this.value = value;
    }

    evaluate(context) {
        return context.returned(this.value.evaluate(context));
    }    
}

class Apply {
    constructor(fVariable, args) {
        this.fVariable = fVariable;
        this.args = args;
    }

    evaluate(context) {
        let f = this.fVariable.evaluate(context);
        let bodyStmt = f.bodyStmt(this.args.map(arg => arg.evaluate(context)));
        return bodyStmt.evaluate(context.childContext());
    }
}

class FunCall {
    constructor(fVariable, args) {
        this.apply = new Apply(fVariable, args);
    } 

    evaluate(context) {
        return this.apply.evaluate(context).returnedValue;
    }    
}

class FunCallWrapper {
    constructor(funcall) {
        this.funcall = funcall;
    }

    evaluate(context) {
        this.funcall.evaluate(context);
        return context;
    }    
}

