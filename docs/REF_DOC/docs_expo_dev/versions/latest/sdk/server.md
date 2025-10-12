# Expo Server

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-
server)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-
server/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-server)

Ask AI

Server-side API and runtime for Expo Router projects.

[GitHub](https://github.com/expo/expo/tree/main/packages/expo-
server)[Changelog](https://github.com/expo/expo/tree/main/packages/expo-
server/CHANGELOG.md)[npm](https://www.npmjs.com/package/expo-server)

Ask AI

Server

Copy

* * *

`expo-server` is a server-side API and runtime library for Expo Router. It
provides helpers you can use in your Expo Router API routes or other server
code, and contains adapters to run Expo Router server exports.

## Installation

Terminal

Copy

`- ``npx expo install expo-server`

To use `expo-server` in your project, you need to configure your Expo Router
project to export in `server` mode. Follow the instructions from Expo Router's
API Routes guide:

[API RoutesLearn how to create server endpoints with Expo
Router.](/router/reference/api-routes)

## Usage

`expo-server`'s runtime APIs can only be used in server-side code and give you
access to the server-side runtime environment. The runtime API exposes
functions that can be called within the async context of request handlers and
give you information about the current request or schedule tasks that run
concurrently to the incoming request.

### Accessing request metadata

    
    
    import { origin, environment } from 'expo-server';
    
    export async function GET() {
      return Response.json({
        isProduction: environment() == null,
        isStating: environment() === 'staging',
        origin: origin(),
      });
    }
    

### Scheduling tasks

    
    
    import { runTask, deferTask } from 'expo-server';
    
    export async function GET() {
      runTask(async () => {
        console.log('will run immediately.');
      });
    
      deferTask(async () => {
        console.log('will run after the response resolved.');
      });
    
      return Response.json({ success: true });
    }
    

## Adapters

`expo-server` exposes adapters to run Expo Router server-side exports in
different environments or on different cloud provider serverless functions.
Typically, every runtime needs its own adapter to function with the `expo-
server` runtime. Before deploying to these providers, it is good to be
familiar with the basics of [`npx expo export`](/more/expo-cli#exporting)
command.

Adapter| Provider  
---|---  
`expo-server/adapter/bun`| [Bun](https://bun.com/docs)  
`expo-server/adapter/express`| [Express](https://expressjs.com/en/5x/api.html)  
`expo-server/adapter/http`| [Node.js](https://nodejs.org/api/http.html)  
`expo-server/adapter/netlify`| [Netlify
Functions](https://docs.netlify.com/build/functions/overview/)  
`expo-server/adapter/vercel`| [Vercel
Functions](https://vercel.com/docs/functions)  
`expo-server/adapter/workerd`| [Cloudflare
Workers](https://developers.cloudflare.com/pages/functions/)  
  
To learn how to host API routes on different third-party services, follow the
instructions from Expo Router's API Routes guide:

[API RoutesLearn how to host API Routes on third-party
services.](/router/reference/api-routes#hosting-on-third-party-services)

By convention, all adapters export a `createRequestHandler` function that
accepts a parameters object. This accepts a `build` parameter that must be set
to the relative path to the `dist/server` output directory that `npx expo
export` created. Some adapters may also accept more values to configure the
runtime API.

    
    
    import path from 'node:path';
    import { createRequestHandler } from 'expo-server/adapter/http';
    
    const onRequest = createRequestHandler({
      build: path.join(process.cwd(), 'dist/server'),
      environment: process.env.NODE_ENV,
    });
    

## API

## Classes

### `StatusError`

Server

Type: Class extends `[Error](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Error)`

An error response representation which can be thrown anywhere in server-side
code.

A `StatusError` can be thrown by a request handler and will be caught by the
`expo-server` runtime and replaced by a `Response` with the `status` and
`body` that's been passed to the `StatusError`.

Example

    
    
    import { StatusError } from 'expo-server';
    
    export function GET(request, { postId }) {
      if (!postId) {
        throw new StatusError(400, 'postId parameter is required');
      }
    }
    

StatusError Properties

### `body`

Server

Type: `string`

### `status`

Server

Type: `number`

## Methods

### `deferTask(fn)`

Server

Parameter| Type| Description  
---|---|---  
fn| `() => [Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<unknown>`| A task
function to execute after the request handler has finished.  
  
  

Defers a task until after a response has been sent.

This only calls the task function once the request handler has finished
resolving a `Response` and keeps the request handler alive until the task is
completed. This is useful to run non-critical tasks after the request handler,
for example to log analytics datapoints. If the request handler rejects with
an error, deferred tasks won't be executed.

Returns:

`void`

### `environment()`

Server

Returns the request's environment, if the server runtime supports this.

In EAS Hosting, the returned environment name is the [alias or deployment
identifier](https://docs.expo.dev/eas/hosting/deployments-and-aliases/), but
the value may differ for other providers.

Returns:

`string | null`

A request environment name, or `null` for production.

### `origin()`

Server

Returns the current request's origin URL.

This typically returns the request's `Origin` header, which contains the
request origin URL or defaults to `null`.

Returns:

`string | null`

A request origin

### `runTask(fn)`

Server

Parameter| Type| Description  
---|---|---  
fn| `() => [Promise](https://developer.mozilla.org/en-
US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<unknown>`| A task
function to execute. The request handler will be kept alive until this task
finishes.  
  
  

Runs a task immediately and instructs the runtime to complete the task.

A request handler may be terminated as soon as the client has finished the
full `Response` and unhandled promise rejections may not be logged properly.
To run tasks concurrently to a request handler and keep the request alive
until the task is completed, pass a task function to `runTask` instead. The
request handler will be kept alive until the task completes.

Returns:

`void`

## Interfaces

### `ImmutableRequest`

Server

Extends: `_ImmutableRequest`

An immutable version of the Fetch API's `Request` as received by middleware
functions. It cannot be mutated or modified, its headers are immutable, and
you won't have access to the request body.

Property| Type| Description  
---|---|---  
method| `string`| The `method` read-only property of the `POST`, etc.) A
String indicating the method of the request. [MDN
Reference](https://developer.mozilla.org/docs/Web/API/Request/method)  
url| `string`| The `url` read-only property of the Request interface contains
the URL of the request. [MDN
Reference](https://developer.mozilla.org/docs/Web/API/Request/url)  
  
### `MiddlewareMatcher`

Server

Middleware matcher settings that restricts the middleware to run
conditionally.

Property| Type| Description  
---|---|---  
methods(optional)| `string[]`| Set this to a list of HTTP methods to
conditionally run middleware on. By default, middleware will match all HTTP
methods.Example`['POST', 'PUT', 'DELETE']`  
patterns(optional)| `(string | RegExp)[]`| Set this to a list of path patterns to conditionally run middleware on. This may be exact paths, paths containing parameter or catch-all segments (`'/posts/[postId]'` or `'/blog/[...slug]'`), or regular expressions matching paths.Example`['/api', '/posts/[id]', '/blog/[...slug]']`  
  
### `MiddlewareSettings`

Server

Exported from a `+middleware.ts` file to configure the server-side middleware
function.

> See: <https://docs.expo.dev/router/reference/middleware/>

Example

    
    
    import type { MiddlewareSettings } from 'expo-server';
    
    export const unstable_settings: MiddlewareSettings = {
      matcher: {
        methods: ['GET'],
        patterns: ['/api', '/admin/[...path]'],
      },
    };
    

Property| Type| Description  
---|---|---  
matcher(optional)| `MiddlewareMatcher`| Matcher definition that restricts the
middleware to run conditionally.  
  
## Types

### `MiddlewareFunction(request)`

Server

Middleware function type. Middleware run for every request in your app, or on
specified conditonally matched methods and path patterns, as per
MiddlewareMatcher.

> See: <https://docs.expo.dev/router/reference/middleware/>

Example

    
    
    import type { MiddlewareFunction } from 'expo-server';
    
    const middleware: MiddlewareFunction = async (request) => {
      console.log(`Middleware executed for: ${request.url}`);
    };
    
    export default middleware;
    

Parameter| Type| Description  
---|---|---  
request| `ImmutableRequest`| An `ImmutableRequest` with read-only headers and
no body access  
  
Returns:

`[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)<Response | void> | Response | void`

