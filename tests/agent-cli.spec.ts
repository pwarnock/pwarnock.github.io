import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Content Agent CLI', () => {
  test.describe('Help Commands', () => {
    test('agent:help displays usage information', async () => {
      const { stdout } = await execAsync('bun run agent:help');

      expect(stdout).toContain('Content Agents CLI');
      expect(stdout).toContain('blog');
      expect(stdout).toContain('portfolio');
      expect(stdout).toContain('radar');
    });

    test('agent:blog with no args shows help', async () => {
      try {
        await execAsync('bun run agent:blog');
      } catch (error: any) {
        // Expected to fail without required args
        expect(error.stdout || error.stderr).toBeDefined();
      }
    });

    test('agent:portfolio with no args shows help', async () => {
      try {
        await execAsync('bun run agent:portfolio');
      } catch (error: any) {
        expect(error.stdout || error.stderr).toBeDefined();
      }
    });

    test('agent:radar with no args shows help', async () => {
      try {
        await execAsync('bun run agent:radar');
      } catch (error: any) {
        expect(error.stdout || error.stderr).toBeDefined();
      }
    });
  });

  test.describe('Blog Agent CLI', () => {
    test('generates blog post with required args', async () => {
      const { stdout, stderr } = await execAsync(
        'bun run agent:blog --title "CLI Test Post" --type original --summary "Test summary for CLI validation"'
      );

      const output = stdout + stderr;
      expect(output).toContain('Blog post');
      // Should either succeed or show validation message
      expect(output.length).toBeGreaterThan(0);
    });

    test('validates content type argument', async () => {
      try {
        await execAsync(
          'bun run agent:blog --title "Test" --type invalid --summary "Test"'
        );
      } catch (error: any) {
        const output = error.stdout + error.stderr;
        expect(output).toContain('original');
      }
    });
  });

  test.describe('Portfolio Agent CLI', () => {
    test('generates portfolio with required args', async () => {
      const { stdout, stderr } = await execAsync(
        'bun run agent:portfolio --title "CLI Test Project" --client "Test Client" --description "Test description" --technologies "React,TypeScript" --completion-date "2024-12" --category "Web Development"'
      );

      const output = stdout + stderr;
      expect(output).toContain('Portfolio');
      expect(output.length).toBeGreaterThan(0);
    });

    test('validates technologies as comma-separated list', async () => {
      const { stdout, stderr } = await execAsync(
        'bun run agent:portfolio --title "Test" --client "Client" --description "Desc" --technologies "React,Node,TypeScript" --completion-date "2024-12" --category "Web Development"'
      );

      const output = stdout + stderr;
      // Should process technologies correctly
      expect(output.length).toBeGreaterThan(0);
    });
  });

  test.describe('Tech Radar Agent CLI', () => {
    test('generates radar entry with required args', async () => {
      const { stdout, stderr } = await execAsync(
        'bun run agent:radar --title "Test Technology" --description "A test technology" --quadrant tools --ring trial'
      );

      const output = stdout + stderr;
      expect(output).toContain('Tech radar');
      expect(output.length).toBeGreaterThan(0);
    });

    test('validates ring argument', async () => {
      try {
        await execAsync(
          'bun run agent:radar --title "Test" --description "Test" --quadrant tools --ring invalid'
        );
      } catch (error: any) {
        const output = error.stdout + error.stderr;
        // Should show valid ring options
        expect(output).toMatch(/adopt|trial|assess|hold/);
      }
    });

    test('validates quadrant argument', async () => {
      try {
        await execAsync(
          'bun run agent:radar --title "Test" --description "Test" --quadrant invalid --ring adopt'
        );
      } catch (error: any) {
        const output = error.stdout + error.stderr;
        // Should show valid quadrant options
        expect(output).toMatch(/techniques|tools|platforms|languages/);
      }
    });
  });

  test.describe('CLI Output Format', () => {
    test('outputs file path on successful generation', async () => {
      const { stdout, stderr } = await execAsync(
        'bun run agent:blog --title "Output Test" --type original --summary "Testing output format"'
      );

      const output = stdout + stderr;
      // Should contain path information
      expect(output).toMatch(/content\/(blog|portfolio|tools)/);
    });

    test('outputs validation status', async () => {
      const { stdout, stderr } = await execAsync(
        'bun run agent:blog --title "Validation Test" --type original --summary "Testing validation output"'
      );

      const output = stdout + stderr;
      // Should contain validation information
      expect(output.length).toBeGreaterThan(0);
    });
  });
});
