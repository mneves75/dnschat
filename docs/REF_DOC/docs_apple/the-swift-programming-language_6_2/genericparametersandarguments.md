  * [ The Swift Programming Language (6.2) ](/swift-book/documentation/the-swift-programming-language)
  * Generic Parameters and Arguments 

# Generic Parameters and Arguments

Generalize declarations to abstract away concrete types.

This chapter describes parameters and arguments for generic types, functions,
and initializers. When you declare a generic type, function, subscript, or
initializer, you specify the type parameters that the generic type, function,
or initializer can work with. These type parameters act as placeholders that
are replaced by actual concrete type arguments when an instance of a generic
type is created or a generic function or initializer is called.

For an overview of generics in Swift, see [Generics](/swift-
book/documentation/the-swift-programming-language/generics).

## [Generic Parameter Clause](/swift-book/documentation/the-swift-programming-
language/genericparametersandarguments/#Generic-Parameter-Clause)

A _generic parameter clause_ specifies the type parameters of a generic type
or function, along with any associated constraints and requirements on those
parameters. A generic parameter clause is enclosed in angle brackets (<>) and
has the following form:

    
    
    <<#generic parameter list#>>
    

The _generic parameter list_ is a comma-separated list of generic parameters,
each of which has the following form:

    
    
    <#type parameter#>: <#constraint#>
    

A generic parameter consists of a _type parameter_ followed by an optional
_constraint_. A _type parameter_ is simply the name of a placeholder type (for
example, `T`, `U`, `V`, `Key`, `Value`, and so on). You have access to the
type parameters (and any of their associated types) in the rest of the type,
function, or initializer declaration, including in the signature of the
function or initializer.

The _constraint_ specifies that a type parameter inherits from a specific
class or conforms to a protocol or protocol composition. For example, in the
generic function below, the generic parameter `T: Comparable` indicates that
any type argument substituted for the type parameter `T` must conform to the
`Comparable` protocol.

    
    
    func simpleMax<T: Comparable>(_ x: T, _ y: T) -> T {
        if x < y {
            return y
        }
        return x
    }
    

Because `Int` and `Double`, for example, both conform to the `Comparable`
protocol, this function accepts arguments of either type. In contrast with
generic types, you don’t specify a generic argument clause when you use a
generic function or initializer. The type arguments are instead inferred from
the type of the arguments passed to the function or initializer.

    
    
    simpleMax(17, 42) // T is inferred to be Int
    simpleMax(3.14159, 2.71828) // T is inferred to be Double
    

### [Generic Where Clauses](/swift-book/documentation/the-swift-programming-
language/genericparametersandarguments/#Generic-Where-Clauses)

You can specify additional requirements on type parameters and their
associated types by including a generic `where` clause right before the
opening curly brace of a type or function’s body. A generic `where` clause
consists of the `where` keyword, followed by a comma-separated list of one or
more _requirements_.

    
    
    where <#requirements#>
    

The _requirements_ in a generic `where` clause specify that a type parameter
inherits from a class or conforms to a protocol or protocol composition.
Although the generic `where` clause provides syntactic sugar for expressing
simple constraints on type parameters (for example, `<T: Comparable>` is
equivalent to `<T> where T: Comparable` and so on), you can use it to provide
more complex constraints on type parameters and their associated types. For
example, you can constrain the associated types of type parameters to conform
to protocols. For example, `<S: Sequence> where S.Iterator.Element: Equatable`
specifies that `S` conforms to the `Sequence` protocol and that the associated
type `S.Iterator.Element` conforms to the `Equatable` protocol. This
constraint ensures that each element of the sequence is equatable.

You can also specify the requirement that two types be identical, using the
`==` operator. For example, `<S1: Sequence, S2: Sequence> where
S1.Iterator.Element == S2.Iterator.Element` expresses the constraints that
`S1` and `S2` conform to the `Sequence` protocol and that the elements of both
sequences must be of the same type.

Any type argument substituted for a type parameter must meet all the
constraints and requirements placed on the type parameter.

A generic `where` clause can appear as part of a declaration that includes
type parameters, or as part of a declaration that’s nested inside of a
declaration that includes type parameters. The generic `where` clause for a
nested declaration can still refer to the type parameters of the enclosing
declaration; however, the requirements from that `where` clause apply only to
the declaration where it’s written.

If the enclosing declaration also has a `where` clause, the requirements from
both clauses are combined. In the example below, `startsWithZero()` is
available only if `Element` conforms to both `SomeProtocol` and `Numeric`.

    
    
    extension Collection where Element: SomeProtocol {
        func startsWithZero() -> Bool where Element: Numeric {
            return first == .zero
        }
    }
    

You can overload a generic function or initializer by providing different
constraints, requirements, or both on the type parameters. When you call an
overloaded generic function or initializer, the compiler uses these
constraints to resolve which overloaded function or initializer to invoke.

For more information about generic `where` clauses and to see an example of
one in a generic function declaration, see [Generic Where Clauses](/swift-
book/documentation/the-swift-programming-language/generics#Generic-Where-
Clauses).

Grammar of a generic parameter clause

 _generic-parameter-clause_ → **`<`** _generic-parameter-list_ **`>`**  
_generic-parameter-list_ → _generic-parameter_ | _generic-parameter_ **`,`** _generic-parameter-list_   
_generic-parameter_ → _type-name_  
_generic-parameter_ → _type-name_ **`:`** _type-identifier_  
_generic-parameter_ → _type-name_ **`:`** _protocol-composition-type_

 _generic-where-clause_ → **`where`** _requirement-list_  
_requirement-list_ → _requirement_ | _requirement_ **`,`** _requirement-list_   
_requirement_ → _conformance-requirement_ | _same-type-requirement_

 _conformance-requirement_ → _type-identifier_ **`:`** _type-identifier_  
_conformance-requirement_ → _type-identifier_ **`:`** _protocol-composition-
type_  
_same-type-requirement_ → _type-identifier_ **`==`** _type_

## [Generic Argument Clause](/swift-book/documentation/the-swift-programming-
language/genericparametersandarguments/#Generic-Argument-Clause)

A _generic argument clause_ specifies the type arguments of a generic type. A
generic argument clause is enclosed in angle brackets (<>) and has the
following form:

    
    
    <<#generic argument list#>>
    

The _generic argument list_ is a comma-separated list of type arguments. A
_type argument_ is the name of an actual concrete type that replaces a
corresponding type parameter in the generic parameter clause of a generic
type. The result is a specialized version of that generic type. The example
below shows a simplified version of the Swift standard library’s generic
dictionary type.

    
    
    struct Dictionary<Key: Hashable, Value>: Collection, ExpressibleByDictionaryLiteral {
        /* ... */
    }
    

The specialized version of the generic `Dictionary` type, `Dictionary<String,
Int>` is formed by replacing the generic parameters `Key: Hashable` and
`Value` with the concrete type arguments `String` and `Int`. Each type
argument must satisfy all the constraints of the generic parameter it
replaces, including any additional requirements specified in a generic `where`
clause. In the example above, the `Key` type parameter is constrained to
conform to the `Hashable` protocol and therefore `String` must also conform to
the `Hashable` protocol.

You can also replace a type parameter with a type argument that’s itself a
specialized version of a generic type (provided it satisfies the appropriate
constraints and requirements). For example, you can replace the type parameter
`Element` in `Array<Element>` with a specialized version of an array,
`Array<Int>`, to form an array whose elements are themselves arrays of
integers.

    
    
    let arrayOfArrays: Array<Array<Int>> = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    

As mentioned in [Generic Parameter Clause](/swift-book/documentation/the-
swift-programming-language/genericparametersandarguments#Generic-Parameter-
Clause), you don’t use a generic argument clause to specify the type arguments
of a generic function or initializer.

Grammar of a generic argument clause

 _generic-argument-clause_ → **`<`** _generic-argument-list_ **`>`**  
_generic-argument-list_ → _generic-argument_ | _generic-argument_ **`,`** _generic-argument-list_   
_generic-argument_ → _type_

  * [ Generic Parameters and Arguments ](/swift-book/documentation/the-swift-programming-language/genericparametersandarguments/#app-top)
  * [ Generic Parameter Clause ](/swift-book/documentation/the-swift-programming-language/genericparametersandarguments/#Generic-Parameter-Clause)
  * [ Generic Where Clauses ](/swift-book/documentation/the-swift-programming-language/genericparametersandarguments/#Generic-Where-Clauses)
  * [ Generic Argument Clause ](/swift-book/documentation/the-swift-programming-language/genericparametersandarguments/#Generic-Argument-Clause)

