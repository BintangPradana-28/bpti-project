---
name: excalidraw-diagramming
description: >-
  Create, inspect, and generate visual software architecture diagrams, ER diagrams, data flows,
  and system workflows in Excalidraw JSON (.excalidraw) and SVG formats.
  Use when visualizing architecture, database models, state machines, or user journeys.
---

# Excalidraw Architecture & Diagramming Skill

This skill teaches the agent how to create structured, clean, and hand-drawn style architecture diagrams for the BPTI Inventory & Asset Management System using Excalidraw.

## Workflow

1. **Plan Diagram Structure**:
   - Nodes: System components (Next.js App Router, Server Actions, Prisma ORM, MySQL 8.4, Better Auth, RBAC Middleware).
   - Edges: HTTP requests, Prisma client calls, SQL queries, session validation.
   - Grouping: Bounding rectangles with dashed borders to delineate domain modules (Inventory, Assets, Maintenance, Monitoring, Audit).

2. **Excalidraw File Format**:
   Excalidraw files are JSON files with `.excalidraw` extension containing:
   ```json
   {
     "type": "excalidraw",
     "version": 2,
     "source": "https://excalidraw.com",
     "elements": [
       {
         "type": "rectangle",
         "version": 1,
         "versionNonce": 1,
         "isDeleted": false,
         "id": "node-1",
         "fillStyle": "solid",
         "strokeWidth": 2,
         "strokeStyle": "solid",
         "roughness": 1,
         "opacity": 100,
         "angle": 0,
         "x": 100,
         "y": 100,
         "strokeColor": "#1e293b",
         "backgroundColor": "#f8fafc",
         "width": 200,
         "height": 80,
         "seed": 100,
         "groupIds": [],
         "roundness": { "type": 3 },
         "boundElements": []
       },
       {
         "type": "text",
         "id": "text-1",
         "x": 120,
         "y": 125,
         "width": 160,
         "height": 30,
         "fontSize": 16,
         "fontFamily": 1,
         "text": "Next.js App Router",
         "textAlign": "center",
         "verticalAlign": "middle",
         "containerId": "node-1"
       }
     ],
     "appState": {
       "viewBackgroundColor": "#ffffff",
       "gridSize": 20
     },
     "files": {}
   }
   ```

3. **Output Formats**:
   - Save directly to `docs/diagrams/<name>.excalidraw`.
   - Also generate equivalent Mermaid diagrams inside markdown documentation for immediate rendering in markdown viewers.
   - When building frontend features, you can embed `@excalidraw/excalidraw` React components for interactive canvas visualization.
