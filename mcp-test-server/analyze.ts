#!/usr/bin/env node
import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Copy your NotionCloneTestAutomationServer class here (or import after fixing)
class NotionCloneTestAutomationServer {
  private repoPath = "tmp/notion-clone";
  
  async analyzeProject() {
    console.log("🔍 Analyzing Notion Clone project structure...");
    if (!(await this.repoExists())) await this.cloneRepo();
    // Simplified for GitHub Actions - just clone & count files
    const { stdout } = await execAsync(`find ${this.repoPath}/src -name "*.tsx" -o -name "*.ts" 2>/dev/null | wc -l`);
    console.log(`✅ Analysis complete: Found ${stdout.trim()} files`);
  }
  
  private async repoExists(): Promise<boolean> {
    try { await fs.access(`${this.repoPath}/package.json`); return true; } catch { return false; }
  }
  
  private async cloneRepo(): Promise<void> {
    console.log("📥 Cloning repo...");
    await execAsync(`rm -rf ${this.repoPath} && git clone https://github.com/ARtoRiAs10/notion-clone.git ${this.repoPath}`);
  }
}

const execAsync = promisify(require('child_process').exec);

// Run synchronously
(async () => {
  const server = new NotionCloneTestAutomationServer();
  await server.analyzeProject();
  console.log('✅ Analysis complete');
})();
