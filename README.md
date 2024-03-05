# Deno-pipe

Simple generic pipeline

## Examples

### Basic

```ts

import { Use, create } from 'jsr:@geacko/pipe'

// middleware factory
function createInc(i: number): Use<number> {
    return (x, next) => next(x + i)
}

// create executable
const execute = create<number>(x => {
    return x ** 2
}, [ 
    1, 
    2, 
    3, 
    4, 
    5,
].map(createInc))

console.log(execute(0))

// console output:
// ---------------
// 225

```

### Chaining

```ts

import { Use, create } from 'jsr:@geacko/pipe'

// middleware factory
function createMiddleware(i: number): Use<number, void> {
    return (x, next) => (console.log(i), next(x))
}

// special middleware
const spec: Use<number, void> = (x, next) => {

    // if x is even -> chain
    if (x % 2 == 0) {

        // chaining
        next = create( next ,
            createMiddleware(1),
            createMiddleware(2),
            createMiddleware(3),
        )

    }

    return next(x)

}

// create process function
const process = create<number, void>(() => void 0 , createMiddleware(0) , spec , createMiddleware(4))

process(1)

// console output:
// ---------------
// 0
// 4

process(2)

// console output:
// ---------------
// 0
// 1
// 2
// 3
// 4

```