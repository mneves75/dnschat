On this page

# Easing

The `Easing` module implements common easing functions. This module is used by
[`Animated.timing()`](/docs/animated#timing) to convey physically believable
motion in animations.

You can find a visualization of some common easing functions at
<https://easings.net/>

### Predefined animations​

The `Easing` module provides several predefined animations through the
following methods:

  * [`back`](/docs/easing#back) provides a basic animation where the object goes slightly back before moving forward
  * [`bounce`](/docs/easing#bounce) provides a bouncing animation
  * [`ease`](/docs/easing#ease) provides a basic inertial animation
  * [`elastic`](/docs/easing#elastic) provides a basic spring interaction

### Standard functions​

Three standard easing functions are provided:

  * [`linear`](/docs/easing#linear)
  * [`quad`](/docs/easing#quad)
  * [`cubic`](/docs/easing#cubic)

The [`poly`](/docs/easing#poly) function can be used to implement quartic,
quintic, and other higher power functions.

### Additional functions​

Additional mathematical functions are provided by the following methods:

  * [`bezier`](/docs/easing#bezier) provides a cubic bezier curve
  * [`circle`](/docs/easing#circle) provides a circular function
  * [`sin`](/docs/easing#sin) provides a sinusoidal function
  * [`exp`](/docs/easing#exp) provides an exponential function

The following helpers are used to modify other easing functions.

  * [`in`](/docs/easing#in) runs an easing function forwards
  * [`inOut`](/docs/easing#inout) makes any easing function symmetrical
  * [`out`](/docs/easing#out) runs an easing function backwards

## Example​

  * TypeScript
  * JavaScript

* * *

# Reference

## Methods​

### `step0()`​

tsx

    
    
    static step0(n: number);  
    

A stepping function, returns 1 for any positive value of `n`.

* * *

### `step1()`​

tsx

    
    
    static step1(n: number);  
    

A stepping function, returns 1 if `n` is greater than or equal to 1.

* * *

### `linear()`​

tsx

    
    
    static linear(t: number);  
    

A linear function, `f(t) = t`. Position correlates to elapsed time one to one.

<https://cubic-bezier.com/#0,0,1,1>

* * *

### `ease()`​

tsx

    
    
    static ease(t: number);  
    

A basic inertial interaction, similar to an object slowly accelerating to
speed.

<https://cubic-bezier.com/#.42,0,1,1>

* * *

### `quad()`​

tsx

    
    
    static quad(t: number);  
    

A quadratic function, `f(t) = t * t`. Position equals the square of elapsed
time.

<https://easings.net/#easeInQuad>

* * *

### `cubic()`​

tsx

    
    
    static cubic(t: number);  
    

A cubic function, `f(t) = t * t * t`. Position equals the cube of elapsed
time.

<https://easings.net/#easeInCubic>

* * *

### `poly()`​

tsx

    
    
    static poly(n: number);  
    

A power function. Position is equal to the Nth power of elapsed time.

n = 4: <https://easings.net/#easeInQuart> n = 5:
<https://easings.net/#easeInQuint>

* * *

### `sin()`​

tsx

    
    
    static sin(t: number);  
    

A sinusoidal function.

<https://easings.net/#easeInSine>

* * *

### `circle()`​

tsx

    
    
    static circle(t: number);  
    

A circular function.

<https://easings.net/#easeInCirc>

* * *

### `exp()`​

tsx

    
    
    static exp(t: number);  
    

An exponential function.

<https://easings.net/#easeInExpo>

* * *

### `elastic()`​

tsx

    
    
    static elastic(bounciness: number);  
    

A basic elastic interaction, similar to a spring oscillating back and forth.

Default bounciness is 1, which overshoots a little bit once. 0 bounciness
doesn't overshoot at all, and bounciness of N > 1 will overshoot about N
times.

<https://easings.net/#easeInElastic>

* * *

### `back()`​

tsx

    
    
    static back(s)  
    

Use with `Animated.parallel()` to create a basic effect where the object
animates back slightly as the animation starts.

* * *

### `bounce()`​

tsx

    
    
    static bounce(t: number);  
    

Provides a basic bouncing effect.

<https://easings.net/#easeInBounce>

* * *

### `bezier()`​

tsx

    
    
    static bezier(x1: number, y1: number, x2: number, y2: number);  
    

Provides a cubic bezier curve, equivalent to CSS Transitions' `transition-
timing-function`.

A useful tool to visualize cubic bezier curves can be found at <https://cubic-
bezier.com/>

* * *

### `in()`​

tsx

    
    
    static in(easing: number);  
    

Runs an easing function forwards.

* * *

### `out()`​

tsx

    
    
    static out(easing: number);  
    

Runs an easing function backwards.

* * *

### `inOut()`​

tsx

    
    
    static inOut(easing: number);  
    

Makes any easing function symmetrical. The easing function will run forwards
for half of the duration, then backwards for the rest of the duration.

[Edit page for next release](https://github.com/facebook/react-native-
website/edit/main/docs/easing.md)[Edit page for current
release](https://github.com/facebook/react-native-
website/edit/main/website/versioned_docs/version-0.81/easing.md)

Last updated on **Aug 20, 2025**

[ PreviousDimensions](/docs/dimensions)[NextI18nManager](/docs/i18nmanager)

  * Predefined animations
  * Standard functions
  * Additional functions
  * Example
  * Methods
    * `step0()`
    * `step1()`
    * `linear()`
    * `ease()`
    * `quad()`
    * `cubic()`
    * `poly()`
    * `sin()`
    * `circle()`
    * `exp()`
    * `elastic()`
    * `back()`
    * `bounce()`
    * `bezier()`
    * `in()`
    * `out()`
    * `inOut()`

