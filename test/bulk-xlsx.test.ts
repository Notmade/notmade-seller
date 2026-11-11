// @vitest-environment node
import { describe, expect, it } from "vitest";
import { xlsxTemplate, readBulkXlsx } from "@/app/lib/bulk-xlsx";

const categories = [{ id: "c1", name: "Fashion" }, { id: "c2", name: "Home decor" }] as never[];

describe("bulk Excel", () => {
  it("reads back its own template and passes the row checks", async () => {
    const buf = await (await xlsxTemplate(categories)).arrayBuffer();
    const { rows, fatal } = await readBulkXlsx(buf, categories);
    expect(fatal).toBeNull();
    expect(rows).toHaveLength(1);
    expect(rows[0].errors).toEqual([]);
    expect(rows[0].listing?.sizes.map((s) => s.size)).toEqual(["S", "M", "L"]);
    expect(rows[0].imageFiles).toEqual(["tee-front.jpg", "tee-back.jpg"]);
  });

  it("rejects a file that is not Excel", async () => {
    const { fatal } = await readBulkXlsx(new TextEncoder().encode("not a workbook").buffer, categories);
    expect(fatal).toMatch(/could not be read/);
  });
});
