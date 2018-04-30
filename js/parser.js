import {Stack} from './util.js';
export {AST};

const STMT_PARSERS = new Map([
    ['sequence', {
        parse(stmts) {
            if(stmts.length === 0 || stmts[0].type === 'empty') {
                return StmtSequence.EMPTY;
            }
    
            return STMT_PARSERS.get(stmts[0].type).parse(stmts);   
        }
    }],    
    ['def', {
        parse(stmts) {
            let [funcName, ...params] = stmts[0].funcTokens();
            let remains = stmts.slice(1);     
            return new StmtSequence(
                new Assign(
                    new Variable('foo'), 
                    new Func(['x'], STMT_PARSERS.get('sequence').parse(remains))
                ),
                STMT_PARSERS.get('sequence').parse(linesAfterDef(remains))
            );
        }
    }],    
    ['assign', {
        parse(stmts) {
            return new StmtSequence(
                new Assign(
                    new Variable(stmts[0].variableName()), 
                    VALUE_PARSERS.get('value').parse(stmts[0])
                ),
                STMT_PARSERS.get('sequence').parse(stmts.slice(1))
            );
        }
    }],
    ['print', {
        parse(stmts) {
            return new StmtSequence(
                new Print(VALUE_PARSERS.get('value').parse(stmts[0])),
                STMT_PARSERS.get('sequence').parse(stmts.slice(1))
            );
        }
    }],
    ['until0', {
        parse(stmts) {
            return new StmtSequence(
                 new UntilZero(
                    VALUE_PARSERS.get('num').parse(stmts[0]), 
                    STMT_PARSERS.get('sequence').parse(stmts.slice(1))
                 ),
                 STMT_PARSERS.get('sequence').parse(linesAfterUntil0(stmts.slice(1)))
            );
        }
    }]
]);

function linesAfterUntil0(stmts, until0 = 1) {
    if(until0 === 0) {
        return stmts;
    }

    let stmt = stmts[0].type;
    let rpts = stmt === 'until0' ? until0 + 1 : 
        (stmt === 'empty' ? until0 - 1 : until0);
    
    return linesAfterUntil0(stmts.slice(1), rpts)
}

function linesAfterDef(stmts, end = 1) {
    if(end === 0) {
        return stmts;
    }

    let stmt = stmts[0].type;
    let rpts = stmt === 'until0' || stmt === 'def' ? end + 1 : 
        (stmt === 'empty' ? end - 1 : end);
    
    return linesAfterUntil0(stmts.slice(1), rpts)
}

const VALUE_PARSERS =  new Map([
    ['value', {
        parse(stmt) {
            // pattern matching from text
            return VALUE_PARSERS.get('text').parse(stmt);
        }
    }],
    ['text', {
        parse(stmt) {
            let text = stmt.textToken();
            return text === null ? VALUE_PARSERS.get('num').parse(stmt) : new Text(text);
        }
    }],
    ['num', {
        parse(stmt) {
            let number = stmt.numberToken();
            return number === null ? VALUE_PARSERS.get('variable').parse(stmt) : new Num(parseFloat(number));
        }        
    }],
    ['variable', {
        parse(stmt) {
            let variable = stmt.variableToken();
            return variable === null ? VALUE_PARSERS.get('expression').parse(stmt) : new Variable(variable);
        }
    }],
    ['expression', {
        parse(stmt) {
            let tokens = stmt.expressionPostfixTokens();
            return tokens.reduce((stack, token) => {
                if('+-*/'.indexOf(token) !== -1) {
                    return reduce(stack, token);
                } 
                let number = parseFloat(token);
                return stack.push(Number.isNaN(number) ? new Variable(token) : new Num(number));
            }, new Stack()).top;
        }
    }]
]);

function reduce(stack, token) {
    let right = stack.top;
    let s1 = stack.pop();
    let left = s1.top;
    let s2 = s1.pop();
    switch(token) {
        case '+':
            return s2.push(new Add(left, right));
        case '-':
            return s2.push(new Substract(left, right));
        case '*':
            return s2.push(new Multiply(left, right));
        case '/':
            return s2.push(new Divide(left, right));                                                           
    }
}

class Context {
    constructor(parent = null, outputs = [], variables = new Map()) {
        this.parent = parent;
        this.outputs = outputs;
        this.variables = variables;
    }

    output(value) {
        return new Context(
            this.parent,
            this.outputs.concat([value]),
            this.variables
        );
    }

    assign(variable, value) {
        return new Context(
            this.parent,
            this.outputs,
            new Map(Array.from(this.variables.entries()).concat([[variable, value]]))
        );
    }
}

class Num {
    constructor(value) {
        this.value = value;
    }

    evaluate(context) {
        return this;
    }
}

class Text {
    constructor(value) {
        this.value = value;
    }

    evaluate(context) {
        return this;
    }
}

class Variable {
    constructor(name) {
        this.name = name;
    }

    evaluate(context) {
        if(this.name.charAt(0) === '-') {
            return new Num(lookUpVariable(context, this.name.slice(1)).value * -1) ;
        }
        return lookUpVariable(context, this.name);
    }
}

function lookUpVariable(context, name) {
    let value = context.variables.get(name);
    return value === undefined ? lookUpVariable(context.parent, name) : value;
}

class Assign {
    constructor(variable, value) {
        this.variable = variable;
        this.value = value;
    }

    evaluate(context) {
        return context.assign(this.variable.name, this.value.evaluate(context));
    }
}

class Print {
    constructor(value) {
        this.value = value;
    }

    evaluate(context) {
        return context.output(this.value.evaluate(context).value);
    }
}

class UntilZero {
    constructor(value, stmt) {
        this.value = value;
        this.stmt = stmt;
    }

    evaluate(context) {
        if(this.value.evaluate(context).value !== 0) {
            let ctx = this.stmt.evaluate(context);
            return this.evaluate(ctx);
        }

        return context;
    }    
}

class StmtSequence {
    constructor(firstStmt, secondStmt) {
        this.firstStmt = firstStmt;
        this.secondStmt = secondStmt;
    }

    evaluate(context) {
        return this.secondStmt.evaluate(this.firstStmt.evaluate(context));
    }
}

StmtSequence.EMPTY = {
    evaluate(context) {
        return context;
    }
};

class Add {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    evaluate(context) {
        return new Num(this.left.evaluate(context).value + this.right.evaluate(context).value);
    }
}

class Substract {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    evaluate(context) {
        return new Num(this.left.evaluate(context).value - this.right.evaluate(context).value);
    }
}

class Multiply {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    evaluate(context) {
        return new Num(this.left.evaluate(context).value * this.right.evaluate(context).value);
    }
}

class Divide {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    evaluate(context) {
        return new Num(this.left.evaluate(context).value / this.right.evaluate(context).value);
    }
}

class AST {
    constructor(tokenizer) {
        this.ast = STMT_PARSERS.get('sequence').parse(tokenizer.tokenize());
    }

    evaluate(context = new Context()) {
        return this.ast.evaluate(context);
    }
}

class Func {
    constructor(params, stmt) {
        this.params = params;
        this.stmt = stmt;
    }

    call(args) {
        return new StmtSequence(assigns(this.params, args), this.stmt);
    }

    evaluate(context) {
        return this;
    }
}

function assigns(params, args) {
    if(params.length === 0) {
        return StmtSequence.EMPTY;
    }
    return new StmtSequence(
                  new Assign(new Variable(params[0]), args[0]), 
                  assigns(params.slice(1), args.slice(1))
            );
}

class FunCall {
    constructor(fVariable, args) {
        this.fVariable = fVariable;
        this.args = args;
    }

    evaluate(context) {
        let f = this.fVariable.evaluate(context);
        let stmt = f.call(this.args);
        let ctx = stmt.evaluate(new Context(context, context.outputs));
        return new Context(context.parent, ctx.outputs, context.variables);
    }    
}

// def foo(x)
//     print a
//     print x
//     y = 30
//     print a + x + y
// end
//
// a = 10
// print 'XD'
// foo(20)

// ast example

// let f_body_seq = new StmtSequence(new Print(new Variable('a'))
// , new StmtSequence(
//     new Print(new Variable('x')), 
//         new StmtSequence(new Assign(new Variable('y'), new Num(30)), 
//             new StmtSequence(new Print(
//                 new Add(new Variable('a'), new Add(new Variable('x'), new Variable('y')))
//                 ),  StmtSequence.EMPTY)
//         )
// ));
// let foo = new Assign(
//     new Variable('foo'), 
//     new Func(['x'], f_body_seq)
// );
// let assign = new Assign(new Variable('a'), new Num(10));
// let p = new Print(new Text('XD'));
// let f_call = new FunCall(new Variable('foo'), [new Num(20)]);
// let globalContext = new Context();
// let ctx = new StmtSequence(
//     foo, new StmtSequence(
//         assign, new StmtSequence(
//             p, new StmtSequence(
//                 f_call, StmtSequence.EMPTY
//             )
//         )
//     )
// ).evaluate(globalContext);
// console.log(ctx.outputs);