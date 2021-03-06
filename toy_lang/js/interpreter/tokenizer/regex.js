export {REGEX};

const NESTED_PARENTHESES_LEVEL = 3; 
const NESTED_BRACKETS_LEVEL = 3; 

const BOOLEAN_REGEX = /true|false/;
const NUMBER_REGEX = /0[box][0-9A-F]+|[0-9]+\.?[0-9e+-]*/;
const TEXT_REGEX = /'((?:[^'\\]|\\'|\\\\|\\r|\\n|\\t)*)'/;
const VARIABLE_REGEX = /[a-zA-Z_]+[a-zA-Z_0-9]*/;
const RELATION_REGEX = /==|!=|>=|>|<=|</;
const LOGIC_REGEX = /and|or/;
const ARITHMETIC_REGEX = /\+|\-|\*|\/|\%/;
const BITWISE_REGEX = /\&|\||\^|<<|>>/;
const NEW_REGEX = /new$/;
const DOT_REGEX = /\./;
const NOT_REGEX = /not/;
const PARENTHESE_REGEX = /\(|\)/;

// For simplicity, only allow three nested parentheses.
// You can change NESTED_PARENTHESES_LEVEL to what level you want.
// More nested parentheses are too complex to code, right?

function nestingParentheses(level) {
    if (level === 0) {
        return '[^()]*';
    }
    return `(?:[^()]|\\(${nestingParentheses(level - 1)}\\))*`;
}

const NESTING_PARENTHESES = nestingParentheses(NESTED_PARENTHESES_LEVEL);

const ARGUMENT_LT_REGEX = new RegExp(`\\((${NESTING_PARENTHESES})\\)`);

function param_lt_regex_capture(captureIt = true) {
    const cmeta = captureIt ? '' : '?:';
    return new RegExp(`\\((${cmeta}(?:(${cmeta}${VARIABLE_REGEX.source},\\s*)+${VARIABLE_REGEX.source})|(${cmeta}${VARIABLE_REGEX.source})?)\\)`);
}

const PARAM_LT_REGEX_NO_CAPTURE = param_lt_regex_capture(false);
const LAMBDA_EXPR_REGEX = new RegExp(`(${PARAM_LT_REGEX_NO_CAPTURE.source}|${VARIABLE_REGEX.source})\\s*->\\s*(${NESTING_PARENTHESES})`);

const IIFE_REGEX = new RegExp(`\\((${LAMBDA_EXPR_REGEX.source})\\)((${ARGUMENT_LT_REGEX.source})+)`);

function ternary_regex_capture(captureIt = true) {
    const cmeta = captureIt ? '' : '?:';
    return new RegExp(`(${cmeta}${NESTING_PARENTHESES})\\s+if\\s+(${cmeta}${NESTING_PARENTHESES})\\s+else\\s+(${cmeta}${NESTING_PARENTHESES})`);
}

const TERNARY_REGEX0 = ternary_regex_capture();
const TERNARY_REGEX_BARE = new RegExp(`^${TERNARY_REGEX0.source}$`);
const TERNARY_REGEX_PARENTHESES = new RegExp(`\\(${TERNARY_REGEX0.source}\\)`);

const TERNARY_REGEX_NO_CAPTURE0 = ternary_regex_capture(false);
const TERNARY_REGEX_NO_CAPTURE = new RegExp(`^${TERNARY_REGEX_NO_CAPTURE0.source}$|\\(${TERNARY_REGEX_NO_CAPTURE0.source}\\)`);

const FUNCALL_REGEX = new RegExp(`((${VARIABLE_REGEX.source}|${TERNARY_REGEX_NO_CAPTURE.source})((${ARGUMENT_LT_REGEX.source})+))`);

function nestingBrackets(level) {
    if (level === 0) {
        return '[^\\[\\]]*';
    }
    return `(?:[^\\[\\]]|\\[${nestingBrackets(level - 1)}\\])*`;  
}

const NESTED_BRACKETS_REGEX = new RegExp(`\\[(${nestingBrackets(NESTED_BRACKETS_LEVEL)})\\]`);

const IMPORT_AS_REGEX = new RegExp(`^(import)\\s+${TEXT_REGEX.source}(\\s+as\\s+(${VARIABLE_REGEX.source}))?$`);
const FROM_IMPORT_REGEX = new RegExp(`^(from)\\s+${TEXT_REGEX.source}(\\s+import\\s+([*a-zA-Z_0-9]+))?$`);

const EXPR_REGEX = orRegexs(
    TERNARY_REGEX_NO_CAPTURE,    
    NESTED_BRACKETS_REGEX,
    IIFE_REGEX,
    LAMBDA_EXPR_REGEX,
    NEW_REGEX,
    FUNCALL_REGEX,
    TEXT_REGEX,
    NUMBER_REGEX,
    BOOLEAN_REGEX,
    VARIABLE_REGEX,
    DOT_REGEX,
    NOT_REGEX,
    BITWISE_REGEX,
    RELATION_REGEX,
    LOGIC_REGEX,
    ARITHMETIC_REGEX,
    PARENTHESE_REGEX
);

const CASE_REGEX = orRegexs(
    TEXT_REGEX,
    NUMBER_REGEX,
    BOOLEAN_REGEX,
    VARIABLE_REGEX
);

function orRegexs(...regexs) {
    const regexSources = regexs.map(regex => regex.source).join('|');
    return new RegExp(`(${regexSources})`);
}

const REGEX = new Map([
    ['boolean', new RegExp(`^(${BOOLEAN_REGEX.source})$`)],
    ['number', new RegExp(`^(${NUMBER_REGEX.source})$`)],
    ['text', new RegExp(`^${TEXT_REGEX.source}$`)],
    ['variable', new RegExp(`^${VARIABLE_REGEX.source}`)],
    ['fcall', new RegExp(`^${FUNCALL_REGEX.source}$`)],
    ['argList', new RegExp(`^${ARGUMENT_LT_REGEX.source}`)],
    ['expression', new RegExp(`^${EXPR_REGEX.source}`)],
    ['lambda', new RegExp(`^${LAMBDA_EXPR_REGEX.source}`)],
    ['iife', new RegExp(`^${IIFE_REGEX.source}$`)],
    ['commaSeperated', new RegExp(`^(${EXPR_REGEX.source}|(,))`)],
    ['func', new RegExp(`^(${VARIABLE_REGEX.source})(?:${param_lt_regex_capture().source})?$`)],
    ['cmd-arg', /^(def|class|if|while|switch)\s+([^{]*)\s+{$/],
    ['else', /^else\s+{$/],
    ['case', new RegExp(`^case\\s+(${CASE_REGEX.source}|((${CASE_REGEX.source},\\s*)+${CASE_REGEX.source}))$`)],
    ['default', /^default$/],
    ['try', /^try\s+{$/],
    ['catch', new RegExp(`^catch\\s+(${VARIABLE_REGEX.source})\\s+{$`)],
    ['variableAssign', new RegExp(`^(${VARIABLE_REGEX.source})\\s*(${ARITHMETIC_REGEX.source}|${BITWISE_REGEX.source})?=\\s*(.*)$`)],
    ['nonlocalAssign', new RegExp(`^nonlocal\\s+(${VARIABLE_REGEX.source})\\s*(${ARITHMETIC_REGEX.source}|${BITWISE_REGEX.source}})?=\\s*(.*)$`)],
    ['propertyAssign', new RegExp(`^(.*)\\.(${VARIABLE_REGEX.source})\\s*(${ARITHMETIC_REGEX.source}}|${BITWISE_REGEX.source})?=[^=](.*)$`)],
    ['return', /^return\s*(.*)$/],
    ['throw', /^throw\s*(.*)$/],
    ['elemList', new RegExp(`^${NESTED_BRACKETS_REGEX.source}`)],
    ['break', /break/],
    ['ternary-bare', TERNARY_REGEX_BARE],
    ['ternary-parentheses', TERNARY_REGEX_PARENTHESES], 
    ['importAs', IMPORT_AS_REGEX],
    ['fromImport', FROM_IMPORT_REGEX]
]);