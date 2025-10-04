[AI SDK Core](/docs/ai-sdk-core)Experimental_StdioMCPTransport

Copy markdown

# `Experimental_StdioMCPTransport`

Creates a transport for Model Context Protocol (MCP) clients to communicate
with MCP servers using standard input and output streams. This transport is
only supported in Node.js environments.

This feature is experimental and may change or be removed in the future.

## Import

    
    
    import { Experimental_StdioMCPTransport } from "ai/mcp-stdio"

## API Signature

### Parameters

### config:

StdioConfig

Configuration for the MCP client.

StdioConfig

### command:

string

The command to run the MCP server.

### args?:

string[]

The arguments to pass to the MCP server.

### env?:

Record<string, string>

The environment variables to set for the MCP server.

### stderr?:

IOType | Stream | number

The stream to write the MCP server's stderr to.

### cwd?:

string

The current working directory for the MCP server.

[Previousexperimental_createMCPClient](/docs/reference/ai-sdk-core/create-mcp-
client)

[NextjsonSchema](/docs/reference/ai-sdk-core/json-schema)

