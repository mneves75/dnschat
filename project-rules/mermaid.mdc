# Mermaid Diagram Generation

Generate Mermaid diagrams for visualizing code structure and relationships.

## Common Diagram Types:

### 1. Entity Relationship Diagrams
For database schemas and data models:
```
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
```

### 2. Flow Charts
For process and logic flow:
```
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[End]
```

### 3. Sequence Diagrams
For interaction flows:
```
sequenceDiagram
    Client->>Server: Request
    Server->>Database: Query
    Database-->>Server: Result
    Server-->>Client: Response
```

### 4. Class Diagrams
For object-oriented design:
```
classDiagram
    class Animal {
        +name: string
        +age: int
        +makeSound()
    }
```

## Process:
1. Analyze source files (SQL, code, docs)
2. Extract entities and relationships
3. Generate appropriate diagram type
4. Include relevant properties/methods
5. Validate syntax with mermaid compiler
6. Save to specified location

## Validation:
Run `npx -p @mermaid-js/mermaid-cli mmdc -i <input>.md -o test.md`

## Best Practices:
- Keep diagrams focused and readable
- Use consistent naming conventions
- Group related entities
- Add labels to relationships
- Include cardinality where relevant
- Use subgraphs for organization
- Add styling for clarity