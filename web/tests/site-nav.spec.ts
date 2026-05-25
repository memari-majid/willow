import { describe, expect, it } from "vitest";

import { SITE_HERO } from "@/lib/site-copy";
import { GUIDE_LIBRARY, HOME_PILLAR_HREFS, HOW_WILLOW_WORKS } from "@/lib/site-nav";

describe("site nav labels", () => {
  it("uses Learn for the skill library hub", () => {
    expect(GUIDE_LIBRARY.href).toBe("/wiki");
    expect(GUIDE_LIBRARY.navLabel).toBe("Learn");
    expect(GUIDE_LIBRARY.pageTitle).toBe("Skill library");
  });

  it("uses How Willow works for knowledge transparency", () => {
    expect(HOW_WILLOW_WORKS.href).toBe("/sources");
    expect(HOW_WILLOW_WORKS.navLabel).toBe("How Willow works");
    expect(HOW_WILLOW_WORKS.pageTitle).toBe("What shapes Willow's answers");
  });

  it("links homepage pillars to source detail pages", () => {
    expect(HOME_PILLAR_HREFS.bookAndRag).toBe("/sources/clinical-reference");
    expect(HOME_PILLAR_HREFS.writtenProtocol).toBe("/sources/cbt-protocol");
    expect(HOME_PILLAR_HREFS.safety).toBe("/sources/safety-guardrails");
  });

  it("uses the warm homepage hero title", () => {
    expect(SITE_HERO.title).toBe("A gentle space to talk things through.");
  });
});
