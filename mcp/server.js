#!/usr/bin/env node

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const path = require('path');

const { listTools } = require('./registry');
const newspaper = require('./renderers/newspaper');
const chat = require('./renderers/chat');
const typing = require('./renderers/typing');
const chart = require('./renderers/chart');
const map = require('./renderers/map');
const notification = require('./renderers/notification');

const RENDERERS = { newspaper, chat, typing, chart, map, notification };

const server = new McpServer({
  name: 'video-tools',
  version: '0.1.0',
});

server.tool(
  'video_list_tools',
  'List all available video generation tools with their parameters, descriptions, and supported formats. Call this first to discover what you can generate.',
  {},
  async () => {
    const data = listTools();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  'video_generate',
  'Generate a video using a specified tool type. Use video_list_tools first to see available tools and their parameters.',
  {
    type: z.string().describe('Tool type: newspaper, chat, typing, chart, map, notification'),
    params: z.record(z.any()).describe('Tool-specific parameters (see video_list_tools for schemas)'),
    outputPath: z.string().describe('Absolute path where the video file will be saved'),
    format: z.string().optional().describe('Output format: mp4 (default), mov, webm (notification only)'),
  },
  async ({ type, params, outputPath, format }) => {
    const renderer = RENDERERS[type];
    if (!renderer) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool type: ${type}. Available: ${Object.keys(RENDERERS).join(', ')}` }) }],
        isError: true,
      };
    }

    const ext = path.extname(outputPath).toLowerCase();
    const resolvedFormat = format || (ext === '.mov' ? 'mov' : ext === '.webm' ? 'webm' : 'mp4');

    try {
      const result = await renderer.generate(params || {}, outputPath, resolvedFormat);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: err.message, stack: err.stack }) }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server error:', err);
  process.exit(1);
});
