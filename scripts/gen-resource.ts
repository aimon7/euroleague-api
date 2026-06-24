import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const resourceName = process.argv[2];

if (!resourceName) {
  console.error("Usage: npm run gen:resource <name>");
  process.exit(1);
}

const normalized = resourceName
  .trim()
  .replace(/[^a-zA-Z0-9-]/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();

if (!normalized) {
  console.error("Resource name must include at least one alphanumeric character.");
  process.exit(1);
}

const className = `${toPascalCase(normalized)}Service`;
const resourceDir = join(process.cwd(), "src", "resources", normalized);

await mkdir(resourceDir, { recursive: true });

await writeFile(
  join(resourceDir, `${normalized}.dto.ts`),
  `export interface ${toPascalCase(normalized)}Params {\n  season: number;\n}\n`
);

await writeFile(
  join(resourceDir, `${normalized}.schema.ts`),
  `import * as z from "zod";\n\nexport const ${toPascalCase(normalized)}Schema = z.object({}).catchall(z.unknown());\nexport type ${toPascalCase(
    normalized
  )} = z.infer<typeof ${toPascalCase(normalized)}Schema>;\n`
);

await writeFile(
  join(resourceDir, `${normalized}.service.ts`),
  `import { BaseResource } from "../../core/base-resource";\n\nexport class ${className} extends BaseResource {}\n`
);

await writeFile(
  join(resourceDir, `${normalized}.service.spec.ts`),
  `import { describe, expect, it } from "vitest";\n\nimport { ${className} } from "./${normalized}.service";\n\ndescribe("${className}", () => {\n  it("is scaffolded", () => {\n    expect(${className}).toBeDefined();\n  });\n});\n`
);

await writeFile(join(resourceDir, "index.ts"), `export { ${className} } from "./${normalized}.service";\n`);

console.log(`Created src/resources/${normalized}`);

function toPascalCase(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
