import { describe, expect, it } from "vitest";

import { GUIDE_LIBRARY, HOW_WILLOW_WORKS } from "@/lib/site-nav";

describe("site nav labels", () => {
  it("uses Library for the guide hub", () => {
    expect(GUIDE_LIBRARY.href).toBe("/wiki");
    expect(GUIDE_LIBRARY.navLabel).toBe("Library");
    expect(GUIDE_LIBRARY.pageTitle).toBe("Guide library");
  });

  it("uses How it works for knowledge transparency", () => {
    expect(HOW_WILLOW_WORKS.href).toBe("/sources");
    expect(HOW_WILLOW_WORKS.navLabel).toBe("How it works");
  });
});
