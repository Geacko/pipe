// Copyright 2024 Grégoire Jacquot. All rights reserved. MIT license.

/** Endpoint type */
export type Executable<I, O = I> = ( 
    input : I 
) => O

/** Middleware type */
export type Use<I, O = I> = ( 
    input : I , next : Executable<I,O>
) => O

export type UseOrIterable<I, O = I> = Use<I,O> | Iterable<UseOrIterable<I,O> | Use<I,O>>

/** @internal */
function isIterable<I,O>( x : UseOrIterable<I,O> ) : x is Iterable<UseOrIterable<I,O>> {
    return Symbol.iterator in x
}

/** @internal */
function collect<I,O>(
    tree : UseOrIterable<I,O> , uses : Use<I,O>[]
) {

    if (isIterable( tree )) {
        for (const x of tree) collect( x , uses )
    } else {
        uses.push( tree )
    }

}

/**
 *  Concat a Tree of Middelwares into a 
 *  array of Middlewares
 */
export function flat<I, O = I>(
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
 *  Concat a Tree of Middelwares into 
 *  one middleware
 */
export function concat<I, O = I>(
    tree : Iterable<UseOrIterable<I,O>>
) : Use<I,O> | undefined {

    const uses : Use<I,O>[] = [
        // ...
    ]

    collect( 
        tree, 
        uses,
    )

    const count = uses.length 

    if (count <= 1) {
        return uses[0]
    }

    return ( e , exec ) => {
        
        let i = -1
        
        const next : Executable<I,O> = ( x ) => {
            return ++i < count ? uses[i]!( x , next ) : exec( x )
        }
        
        return next( e )

    }

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

    const next 
        = concat( uses )

    return next ? ( e ) => next( e , exec ) 
         : exec

}
