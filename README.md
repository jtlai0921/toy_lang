# Toy Lang

Toy lang was started from a [gist](https://gist.github.com/JustinSDK/9c38136b90137387ad3518d4e99d15ba). It's the first language I made. ES6 modules support is required.

- Keywords: `if`, `else`, `while`, `def`, `return`, `and`, `or`, `not`, `new`, `class`, `this`, `arguments`
- Literals: 3.14 (number), `true`, `false`, `'Hello, World'` (string), `\r`, `'\n'`, `'\t'`, `'\\'`, `'\''`
- Operators: `new`, `.`, `==`, `!=`, `>=`, `>`, `<=`, `<`, `and`, `or`, `not`, `+`, `-`, `*`, `/`, `%`
- Built-in functions: `print`, `println`, `printf`, `hasValue`, `noValue`, `list`, `format`
- Built-in classes: `Object`, `Class`, `Function`, `String`, `List`
- Comment: `#`

[Play It](https://openhome.cc/Gossip/Computation/toy_lang/)

# Examples

- Multiplication Table

```python
def print_row(n) {
    i = 2
    while i < 10 {
        printf('{0}*{1}={2}\t', i, n, i * n)
        i = i + 1 
    }
    println()
}

range(1, 10).forEach(print_row)
```

- Tower of Hanoi

```python
def hanoi(n, a, b, c) {
    if n == 1 {
        printf('Move sheet from {0} to {1}\n', a , c)
    } 
    else {
        hanoi(n - 1, a, c, b)
        hanoi(1, a, b, c)
        hanoi(n - 1, b, a, c) 
    }
}

hanoi(3, 'A', 'B', 'C')
```

- Factorial

```Java
def factorial(n) {
    if n == 0 {
        return 1
    }

    return n * factorial(n - 1)
}

# use \ for cross-line expression
range(1, 6).map(n -> '{0}! = {1}'.format(n, factorial(n))) \
           .forEach(println)
```

- Class

```java
class Account {
    # it's a field
    balance = 0 

    def init(number, name) {
        this.number = number
        this.name = name
    }

    def deposit(amount) {
        if amount <= 0 {
            throw 'must be positive'
        }

        this.balance = this.balance + amount
    }

    def toString() {
        return format('{0}, {1}, {2}', this.number, this.name, this.balance)
    }
}

acct = new Account('123', 'Justin')
acct.deposit(100)

println(acct)
```

- Built-in Classes

```java
def sum(lt) {
    if lt.isEmpty() {
        return 0
    }
    
    return lt.get(0) + sum(lt.slice(1))
}
    
lt = range(1, 11)
printf('{0}={1}\n', lt.join('+'), sum(lt))

println(new String('aBc').toUpperCase())
println(new String('aBc').toLowerCase())
```

- Closure

```javascript
def foo() {
    x = 10
    def inner(y) {
        # closure closes the variable x, not its value
        return x + y
    }
    x = 30 
    return inner
}

f = foo()
println('f(20) is ' + f(20))

def orz() {
    x = 10
    class Inner {
        y = x
        def init(p) {
            # closure closes the variable x, not its value
            this.z = x + p
        }

        def x() {
            # closure closes the variable x, not its value
            return x
        }
    }
    x = 30
    return Inner
}

clz = orz()
obj = new clz(20)

println('obj.x() is ' + obj.x())
println('obj.y is ' + obj.y)
println('obj.z is ' + obj.z)
```

- Lambda expression

```java    
list(1, 2, 3, 4, 5).filter(elem -> elem >= 2) \
                   .map(elem -> elem * 100)   \
                   .forEach(println)

def foo(x, y) {
    return () -> x + y
}

println(foo(10, 20)())

def orz() {
    x = 10
    return (y, z) -> x + y + z 
}

println(orz()(100, 200))

# IIFE
(() -> println('XD'))()
(x -> println(x))('XD')
println(((x, y) -> x + y)(1, 2))
```

- Mixin

```ruby
class Ordered {
    def lessThan(that) {
        return this.compare(that) < 0
    }

    def lessEqualsThan(that) {
        return this.lessThan(that) or this.equals(that)
    }

    def greaterThan(that) {
        return not this.lessEqualsThan(that)
    }

    def greaterEqualsThan(that) {
        return not this.lessThan(that)
    }
}

class Circle {
    def init(radius) {
        this.radius = radius
    }

    def compare(that) {
        return this.radius - that.radius
    }

    def equals(that) {
        return this.radius == that.radius
    }
}

Circle.mixin(Ordered)

c1 = new Circle(10)
c2 = new Circle(20)

println(c1.lessThan(c2))
println(c1.lessEqualsThan(c2))
println(c1.greaterThan(c2))
println(c1.greaterEqualsThan(c2))
```

- Inheritance 1

```python
class PA {
    def init() {
        println('PA init')
    }

    def ma() {
        println('ma')
    }
}

class PB {
    def mb() {
        println('mb')
    }
}

class C(PA, PB) {
    def init() {
        PA.method('init').apply(this) # super init
        println('C init')
    }

    def mc() {
        println('mc')
    }

    def ma() {
        PA.method('ma').apply(this) # super method
        println('c.ma()')
    }
}

c = new C()
c.ma()
c.mb()
c.mc()
```

- Inheritance 2

```python
class Ordered {
    def lessThan(that) {
        return this.compare(that) < 0
    }

    def lessEqualsThan(that) {
        return this.lessThan(that) or this.equals(that)
    }

    def greaterThan(that) {
        return not this.lessEqualsThan(that)
    }

    def greaterEqualsThan(that) {
        return not this.lessThan(that)
    }
}

class Circle(Ordered) {
    def init(radius) {
        this.radius = radius
    }

    def compare(that) {
        return this.radius - that.radius
    }

    def equals(that) {
        return this.radius == that.radius
    }
}

c1 = new Circle(10)
c2 = new Circle(20)

println(c1.lessThan(c2))
println(c1.lessEqualsThan(c2))
println(c1.greaterThan(c2))
println(c1.greaterEqualsThan(c2))
```

- meta programming 1

```javascript
println(Object.ownMethods())
Object.deleteOwnMethod('toString')    
println(Object.ownMethods())

def toString() {
    props = this.ownProperties()
    # each prop is a List instance which contains name and value
    return  props.map(prop -> prop.join()).join('\n')
}

o = new Object()
o.x = 10
o.y = 20
o.z = 30

println(toString.apply(o))

def foo(p) {
    return this.x + this.y + this.z + p
}

# The 2nd parameter of the apply method accepts a List instance. 
println(foo.apply(o, list(40)))
```

- meta programming 2

```javascript
class PA {
    def pa() {
        println('pa')
    }
}

class PB {
    def pb() {
        println('pb')
    }
}

class C {
    def c() {
        println('c') 
    }
}

println(C.parents())
C.setParents(list(PA, PB))
println(C.parents())

new C().pa()
new C().pb()
new C().c()
```

----------

[openhome.cc](https://openhome.cc)