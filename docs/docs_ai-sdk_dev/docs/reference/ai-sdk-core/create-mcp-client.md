[AI SDK Core](/docs/ai-sdk-core)experimental_createMCPClient

Copy markdown

# `experimental_createMCPClient()`

Creates a lightweight Model Context Protocol (MCP) client that connects to an
MCP server. The client's primary purpose is tool conversion between MCP tools
and AI SDK tools.

It currently does not support accepting notifications from an MCP server, and
custom configuration of the client.

This feature is experimental and may change or be removed in the future.

## Import

    
    
    import { experimental_createMCPClient } from "ai"

## API Signature

### Parameters

### config:

MCPClientConfig

Configuration for the MCP client.

MCPClientConfig

### transport:

TransportConfig = MCPTransport | McpSSEServerConfig

Configuration for the message transport layer.

MCPTransport

### start:

() => Promise<void>

A method that starts the transport

### send:

(message: JSONRPCMessage) => Promise<void>

A method that sends a message through the transport

### close:

() => Promise<void>

A method that closes the transport

### onclose:

() => void

A method that is called when the transport is closed

### onerror:

(error: Error) => void

A method that is called when the transport encounters an error

### onmessage:

(message: JSONRPCMessage) => void

A method that is called when the transport receives a message

McpSSEServerConfig

### type:

'sse'

Use Server-Sent Events for communication

### url:

string

URL of the MCP server

### headers?:

Record<string, string>

Additional HTTP headers to be sent with requests.

### name?:

string

Client name. Defaults to "ai-sdk-mcp-client"

### onUncaughtError?:

(error: unknown) => void

Handler for uncaught errors

### Returns

Returns a Promise that resolves to an `MCPClient` with the following methods:

### tools:

async (options?: { schemas?: TOOL_SCHEMAS }) =>
Promise<McpToolSet<TOOL_SCHEMAS>>

Gets the tools available from the MCP server.

options

### schemas?:

TOOL_SCHEMAS

Schema definitions for compile-time type checking. When not provided, schemas
are inferred from the server.

### close:

async () => void

Closes the connection to the MCP server and cleans up resources.

## Example

    
    
    import { experimental_createMCPClient, generateText } from 'ai';
    
    import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';
    
    import { openai } from '@ai-sdk/openai';
    
    
    
    
    let client;
    
    
    
    
    try {
    
      client = await experimental_createMCPClient({
    
        transport: new Experimental_StdioMCPTransport({
    
          command: 'node server.js',
    
        }),
    
      });
    
    
    
    
      const tools = await client.tools();
    
    
    
    
      const response = await generateText({
    
        model: openai('gpt-4o-mini'),
    
        tools,
    
        messages: [{ role: 'user', content: 'Query the data' }],
    
      });
    
    
    
    
      console.log(response);
    
    } catch (error) {
    
      console.error('Error:', error);
    
    } finally {
    
      // ensure the client is closed even if an error occurs
    
      if (client) {
    
        await client.close();
    
      }
    
    }

## Error Handling

The client throws `MCPClientError` for:

  * Client initialization failures
  * Protocol version mismatches
  * Missing server capabilities
  * Connection failures

For tool execution, errors are propagated as `CallToolError` errors.

For unknown errors, the client exposes an `onUncaughtError` callback that can
be used to manually log or handle errors that are not covered by known error
types.

[PreviousdynamicTool](/docs/reference/ai-sdk-core/dynamic-tool)

[NextExperimental_StdioMCPTransport](/docs/reference/ai-sdk-core/mcp-stdio-
transport)

