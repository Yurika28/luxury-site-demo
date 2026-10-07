import { expect, test, type Page } from "@playwright/test";

const SAVED = {
  state: {
    mode: "package",
    guests: 2,
    packageId: "costa",
    roomId: "ocean",
    nights: 4,
    addons: ["yacht", "transfers"],
    reference: "MC26-48K2QX",
    guest: {
      name: "Sofia Marin",
      email: "sofia.marin@example.com",
      phone: "+34 612 345 678",
      nationality: "Spain",
      flight: "IB6275",
      arrivalDate: "2026-12-09",
      arrivalTime: "14:30",
      notes: "",
    },
  },
  version: 1,
};

const ROUTES = [
  "/",
  "/booking/choose",
  "/booking/customise",
  "/booking/build/room",
  "/booking/build/experiences",
  "/booking/guest",
  "/booking/review",
  "/booking/confirmation",
  "/this-page-does-not-exist",
];

async function seed(page: Page) {
  await page.addInitScript((saved) => {
    if (!window.localStorage.getItem("mare-booking")) window.localStorage.setItem("mare-booking", JSON.stringify(saved));
    window.sessionStorage.setItem("mare:seen", "1");
  }, SAVED);
}

/** Wait until the page has finished loading its mock data (skeletons gone). */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[aria-busy=true]")).toHaveCount(0, { timeout: 10_000 });
}

test.describe("no horizontal overflow", () => {
  for (const route of ROUTES) {
    test(route, async ({ page }) => {
      await seed(page);
      await page.goto(route);
      await settle(page);
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(m.sw, `scrollWidth ${m.sw} > viewport ${m.cw}`).toBeLessThanOrEqual(m.cw);
    });
  }
});

test.describe("touch targets are at least 44px", () => {
  for (const route of ROUTES) {
    test(route, async ({ page }) => {
      await seed(page);
      await page.goto(route);
      await settle(page);
      const small = await page.evaluate(() => {
        const out: string[] = [];
        const els = document.querySelectorAll<HTMLElement>("a[href], button, select, input:not([type=radio]):not([type=checkbox]), textarea");
        els.forEach((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (r.width === 0 || r.height === 0 || cs.visibility === "hidden" || cs.display === "none") return;
          if (el.closest("[inert]") || el.closest("[hidden]")) return;
          // Off-screen skip links and sr-only helpers
          if (r.right < 0 || r.bottom < 0 || r.width <= 1 || r.height <= 1) return;
          if (r.height < 43.5 || r.width < 43.5) out.push(`${el.tagName} "${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
        });
        return out;
      });
      expect(small, small.join("\n")).toEqual([]);
    });
  }
});

test.describe("layout follows the breakpoint", () => {
  test("price summary: sticky bar below 1024px, side panel at 1024px and up", async ({ page }, info) => {
    await seed(page);
    await page.goto("/booking/customise");
    await settle(page);
    const wide = (page.viewportSize()?.width ?? 0) >= 1024;
    const bar = page.locator("div.fixed.bottom-0");
    const aside = page.getByRole("complementary", { name: "Your booking" });
    if (wide) {
      await expect(aside).toBeVisible();
      await expect(bar).toBeHidden();
    } else {
      await expect(bar).toBeVisible();
      await expect(aside).toBeHidden();
      // The bar must not cover the last card: page leaves room under the content
      const box = await bar.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
    }
    await page.screenshot({ path: info.outputPath("customise.png") });
  });

  test("add-on cards: one column on a phone, two from 768px", async ({ page }) => {
    await seed(page);
    await page.goto("/booking/customise");
    await settle(page);
    const xs = await page.locator("article").evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().left))).size);
    const w = page.viewportSize()!.width;
    expect(xs).toBe(w >= 768 ? 2 : 1);
  });

  test("landing: header stays on screen when scrolled, and the Book button stays reachable", async ({ page }) => {
    await seed(page);
    await page.goto("/");
    await page.mouse.wheel(0, 1400);
    await page.waitForTimeout(500);
    const book = page.getByRole("link", { name: /^book/i }).first();
    await expect(book).toBeInViewport();
    await expect(book).toHaveCSS("background-color", "rgb(176, 78, 43)");
  });

  test("landing: header label switches between 'Book' and 'Book your experience'", async ({ page }) => {
    await page.goto("/");
    const w = page.viewportSize()!.width;
    const cta = page.locator("header a[href='/booking/choose']");
    // Only one of the two labels is visible at a time
    await expect(cta.locator("span:visible")).toHaveText(w >= 768 ? "Book your experience" : "Book");
  });

  test("headings never overflow their container", async ({ page }) => {
    for (const route of ["/booking/choose", "/booking/review", "/this-page-does-not-exist"]) {
      await seed(page);
      await page.goto(route);
      await settle(page);
      const bad = await page.evaluate(() =>
        [...document.querySelectorAll("h1, h2")].filter((h) => h.scrollWidth > h.clientWidth + 1).map((h) => h.textContent),
      );
      expect(bad, route).toEqual([]);
    }
  });
});

test.describe("the booking flow works at this size", () => {
  test("choose → customise → guest → review → confirmation", async ({ page }) => {
    await page.goto("/booking/choose");
    await settle(page);
    await page.getByRole("radio").nth(1).check({ force: true });
    await page.locator("a:visible", { hasText: /^continue$/i }).click();

    await expect(page).toHaveURL(/customise/);
    await settle(page);
    await page.getByRole("button", { name: /Add · \$1,700/ }).click();
    await expect(page.getByRole("button", { name: /Added · \$1,700/ })).toHaveAttribute("aria-pressed", "true");
    await page.locator("a:visible", { hasText: /^continue$/i }).click();

    await expect(page).toHaveURL(/guest/);
    await page.locator("button[form=guest-form]:visible").click();
    await expect(page.getByRole("alert").filter({ hasText: "need" })).toBeFocused();

    await page.getByLabel("Full name").fill("Sofia Marin");
    await page.getByLabel("Email").fill("sofia.marin@example.com");
    await page.getByLabel("Phone").fill("+34 612 345 678");
    await page.getByLabel("Nationality").selectOption("Spain");
    await page.getByLabel("Flight number").fill("IB6275");
    await page.getByLabel("Arrival date").fill("2026-12-09");
    await page.getByLabel("Arrival time").fill("14:30");
    await page.locator("button[form=guest-form]:visible").click();

    await expect(page).toHaveURL(/review/);
    await expect(page.getByText("$8,100").first()).toBeVisible();
    await page.getByRole("checkbox").check();
    await page.locator("button:visible", { hasText: /^confirm/i }).click();

    await expect(page).toHaveURL(/confirmation/, { timeout: 10_000 });
    await expect(page.getByText(/^MC26-[A-Z0-9]{6}$/)).toBeVisible();
    const m = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(m).toBe(true);
  });
});
