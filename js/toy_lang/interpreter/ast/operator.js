import {Primitive} from './value.js';
import {Instalization} from './class.js';

export {BINARY_OPERATORS, UNARY_OPERATORS};

function createPrimitiveBinaryOperatorNode(operator) {
    return class PrimitiveBinaryOperator {
        constructor(left, right) {
            this.left = left;
            this.right = right;
        }
    
        evaluate(context) {
            const left = this.left.evaluate(context);
            const right = this.right.evaluate(context);
            return operator(
                left.value === undefined ? left.toString(context) : left.value, 
                right.value === undefined ? right.toString(context) : right.value
            );
        }
    }
}

class NewOperator {
    constructor(operand) {
        this.operand = operand;
    }

    evaluate(context) {
        return new Instalization(this.operand.fVariable, this.operand.args).evaluate(context);
    }
}

class DotOperator {
    constructor(receiver, message) {
        this.receiver = receiver;
        this.message = message;
    }

    evaluate(context) {
        const instance = this.receiver.evaluate(context);
        return this.message.send(context, instance);
    }
}

class NotOperator {
    constructor(operand) {
        this.operand = operand;
    }

    evaluate(context) {
        return Primitive.boolNode(!this.operand.evaluate(context).value);
    }
}

const UNARY_OPERATORS = new Map([
    ['new', NewOperator], 
    ['not', NotOperator]
]);

function p(v) {
    return new Primitive(v);
}

function bool(v) {
    return Primitive.boolNode(v);
}

const BINARY_OPERATORS = new Map([
    ['.', DotOperator],
    ['+', createPrimitiveBinaryOperatorNode((a, b) => p(a + b))],
    ['-', createPrimitiveBinaryOperatorNode((a, b) => p(a - b))],
    ['*', createPrimitiveBinaryOperatorNode((a, b) => p(a * b))],
    ['/', createPrimitiveBinaryOperatorNode((a, b) => p(a / b))],
    ['%', createPrimitiveBinaryOperatorNode((a, b) => p(a % b))],
    ['==', createPrimitiveBinaryOperatorNode((a, b) => bool(a === b))],
    ['!=', createPrimitiveBinaryOperatorNode((a, b) => bool(a !== b))],
    ['>=', createPrimitiveBinaryOperatorNode((a, b) => bool(a >= b))],
    ['>', createPrimitiveBinaryOperatorNode((a, b) => bool(a > b))],
    ['<=', createPrimitiveBinaryOperatorNode((a, b) => bool(a <= b))],
    ['<', createPrimitiveBinaryOperatorNode((a, b) => bool(a < b))],
    ['and', createPrimitiveBinaryOperatorNode((a, b) => Primitive.from(a && b))],
    ['or', createPrimitiveBinaryOperatorNode((a, b) => Primitive.from(a || b))]
]);
