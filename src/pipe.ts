// Copyright 2024 Grégoire Jacquot <gregoirejacquot@outlook.com>. All rights reserved. MIT license.

/** Endpoint type */
export type Executable<I, O = I> = ( 
    input : I 
) => O

/** Middleware type */
export type Use<I, O = I> = ( 
    input : I , next : Executable<I,O>
) => O

export type UseOrIterable<I, O = I> = Use<I,O> | Iterable<UseOrIterable<I,O> | Use<I,O>>

function isIterable<I,O>( x : UseOrIterable<I,O> ) : x is Iterable<UseOrIterable<I,O>> {
    return Symbol.iterator in x
}

function collect<I,O>(
    tree : UseOrIterable<I,O> , uses : Use<I,O>[]
) {

    if (isIterable( tree )) {
        for (const x of tree) collect( x , uses )
    } else {
        uses.push( tree )
    }

}

function flat<I, O = I>(
    tree : Iterable<UseOrIterable<I,O>>
) : Use<I,O>[] {

    const uses : Use<I,O>[] = [
        // ...
    ]

    collect( 
        tree, 
        uses,
    )

    return uses

}

/**
 *  Create a new pipeline using middlewares `uses` and endpoint `exec`.
 * 
 *  ```
 *  import { create } from 'https://deno.land/x/deno_pipe@1.0.0/mod.ts'
 *  
 *  // simple middleware factory
 *  function createInc(i: number) : Use<number> {
 *      return (x, next) => next(x + i)
 *  }
 *  
 *  // middlewares
 *  const uses = [ 
 *      1, 
 *      2, 
 *      3, 
 *      4, 
 *      5,
 *  ].map(createInc)
 *
 *  // endpoint
 *  const doit : Executable<number> = (x) => {
 *      return x ** 2
 *  }
 * 
 *  // create process function
 *  const execute = create(doit, ...uses)
 * 
 *  console.log(execute(0))
 *  ```
 */
export function create<I, O = I>(
    exec : Executable<I,O> , ... uses : UseOrIterable<I,O>[]
) : Executable<I,O> {

    return flat(uses).reverse().reduce((next: Executable<I, O>, use) => x => use(x, next), exec)

}