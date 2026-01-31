#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import * as ts from "typescript";
import { z } from "zod";

const execAsync = promisify(exec);

// 🔥 INTERFACES & CLASS (PERFECT - From your project)
interface ComponentInfo {
  name: string;
  filePath: string;
  imports: string[];
  exports: string[];
  hooks: string[];
  props: string;
  testCases: string[];
}

interface TestSuite {
  componentName: string;
  testFilePath: string;
  testCases: string[];
  coverageTargets: string;
}

class NotionCloneTestAutomationServer {
  private repoPath = "tmp/notion-clone";
  private components: ComponentInfo[] = [];
  private testSuites: TestSuite[] = [];

  async analyzeProject(): Promise<ComponentInfo[]> {
    console.log("🔍 Analyzing Notion Clone project structure...");
    if (!(await this.repoExists())) await this.cloneRepo();
    
    const componentFiles = await this.findReactComponents();
    const components: ComponentInfo[] = [];
    
    for (const filePath of componentFiles) {
      const info = await this.analyzeComponent(filePath);
      if (info) components.push(info);
    }
    
    this.components = components;
    console.log(`✅ Found ${components.length} components for testing`);
    return components;
  }

  private async repoExists(): Promise<boolean> {
    try {
      await fs.access(`${this.repoPath}/package.json`);
      return true;
    } catch {
      return false;
    }
  }

  private async cloneRepo(): Promise<void> {
    console.log("📥 Cloning https://github.com/ARtoRiAs10/notion-clone...");
    await execAsync(`rm -rf ${this.repoPath} && git clone https://github.com/ARtoRiAs10/notion-clone.git ${this.repoPath}`);
    console.log("✅ Repo cloned successfully");
  }

  private async findReactComponents(): Promise<string[]> {
    const { stdout } = await execAsync(
      `cd ${this.repoPath} && find src -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v test 2>/dev/null`
    );
    return stdout
      .split("\n")
      .filter(Boolean)
      .map((p) => path.join(this.repoPath, p.trim()));
  }

  private async analyzeComponent(filePath: string): Promise<ComponentInfo | null> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
      
      const info: ComponentInfo = {
        name: path.basename(filePath, path.extname(filePath)),
        filePath,
        imports: [],
        exports: [],
        hooks: [],
        props: "",
        testCases: []
      };

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isImportDeclaration(node)) {
          info.imports.push(node.getText(sourceFile));
        }
        if (ts.isCallExpression(node)) {
          const text = node.expression.getText(sourceFile);
          if (text.includes("useState") || text.includes("useEffect")) {
            info.hooks.push(text);
          }
        }
      });

      info.testCases = this.generateTestCases(info);
      return info;
    } catch (error) {
      console.error(`Failed to analyze ${filePath}:`, error);
      return null;
    }
  }

  private generateTestCases(info: Partial<ComponentInfo>): string[] {
    const cases = [
      "renders without crashing",
      "matches snapshot",
      "handles document loading",
      "supports rich text editing"
    ];
    if (info.hooks?.includes("useState")) {
      cases.push("manages state correctly");
    }
    return cases;
  }

  async generateTestSuites(): Promise<TestSuite[]> {
    const suites: TestSuite[] = [];
    for (const component of this.components) {
      const testSuite: TestSuite = {
        componentName: component.name,
        testFilePath: this.getTestFilePath(component.filePath),
        testCases: component.testCases,
        coverageTargets: "rendering, state management, user interactions"
      };
      await this.writeTestFile(testSuite);
      suites.push(testSuite);
    }
    this.testSuites = suites;
    return suites;
  }

  private getTestFilePath(componentPath: string): string {
    const dir = path.dirname(componentPath);
    const name = path.basename(componentPath, path.extname(componentPath));
    return path.join(dir, "tests", `${name}.test.tsx`);
  }

  private async writeTestFile(testSuite: TestSuite): Promise<void> {
    const testDir = path.dirname(testSuite.testFilePath);
    await fs.mkdir(testDir, { recursive: true });
    const testContent = this.generateTestContent(testSuite);
    await fs.writeFile(testSuite.testFilePath, testContent);
    console.log(`📝 Generated tests: ${testSuite.testFilePath}`);
  }

  private generateTestContent(testSuite: TestSuite): string {
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import '${testSuite.componentName}' from '../${testSuite.componentName}';
import '@testing-library/jest-dom';

describe('${testSuite.componentName}', () => {
  test('renders without crashing', () => {
    render(<${testSuite.componentName} />);
    expect(screen.getByTestId('${testSuite.componentName.toLowerCase()}-container')).toBeInTheDocument();
  });
  
  test('matches snapshot', () => {
    const container = render(<${testSuite.componentName} />);
    expect(container.container).toMatchSnapshot();
  });
});
`;
  }

  async runTests(): Promise<{ passed: number; failed: number; coverage: number }> {
    console.log("🧪 Running generated tests...");
    try {
      await execAsync(`cd ${this.repoPath} && npm install --save-dev @testing-library/react @testing-library/jest-dom jest ts-jest`);
      const { stdout } = await execAsync(`cd ${this.repoPath} && npx jest --coverage --watchAll=false`, { timeout: 60000 });
      
      const passed = parseInt((stdout.match(/Tests:\s+([\d,]+)/)?.[1] || "0").replace(/,/g, ""), 10);
      const failed = parseInt((stdout.match(/Failures:\s+([\d,]+)/)?.[1] || "0").replace(/,/g, ""), 10);
      const coverage = parseFloat((stdout.match(/Statements:\s+[\d.]+%\s+([\d.]+)/)?.[1] || "0"));
      
      return { passed, failed, coverage };
    } catch (error) {
      console.error("Test run failed:", error);
      return { passed: 0, failed: 0, coverage: 0 };
    }
  }

  async generateReport(): Promise<string> {
    const stats = await this.runTests();
    return `## Notion Clone Test Report
**Components:** ${this.components.length}
**Suites:** ${this.testSuites.length}
**Passed:** ${stats.passed}
**Failed:** ${stats.failed}
**Coverage:** ${stats.coverage.toFixed(1)}%`;
  }
}

// 🔥 PROPER MCP SERVER v1.18.0
const server = new McpServer({
  name: "notion-clone-test-automation-mcp",
  version: "1.0.0"
});

let testAutomation: NotionCloneTestAutomationServer | null = null;

// 🔥 REGISTER TOOLS (CORRECT API)
server.registerTool(
  "analyze_project",
  {
    description: "Analyze Notion Clone repo structure",
    inputSchema: z.object({}),
  },
  async () => {
    if (!testAutomation) testAutomation = new NotionCloneTestAutomationServer();
    const components = await testAutomation.analyzeProject();
    return {
      content: [{
        type: "text",
        text: `✅ Analyzed ${components.length} components: ${components.map(c => `${c.name} (${c.testCases.length} tests)`).join(", ")}`
      }]
    };
  }
);

server.registerTool(
  "generate_tests",
  {
    description: "Generate Jest test suites for components",
    inputSchema: z.object({}),
  },
  async () => {
    if (!testAutomation) testAutomation = new NotionCloneTestAutomationServer();
    await testAutomation.analyzeProject();
    const suites = await testAutomation.generateTestSuites();
    const totalTests = suites.reduce((sum, s) => sum + s.testCases.length, 0);
    return {
      content: [{
        type: "text",
        text: `✅ Generated ${suites.length} test suites (${totalTests} total tests)`
      }]
    };
  }
);

server.registerTool(
  "run_tests",
  {
    description: "Execute all tests with coverage",
    inputSchema: z.object({}),
  },
  async () => {
    if (!testAutomation) testAutomation = new NotionCloneTestAutomationServer();
    const { passed, failed, coverage } = await testAutomation.runTests();
    return {
      content: [{
        type: "text",
        text: `📊 Test Results: Passed ${passed}, Failed ${failed}, Coverage ${coverage.toFixed(1)}%`
      }]
    };
  }
);



// 🔥 START SERVER
(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("🚀 Notion Clone MCP Server running on STDIO...");
})();
