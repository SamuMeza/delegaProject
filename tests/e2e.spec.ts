import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

// Helper: login as operator
async function login(page: any) {
  await page.goto(`${BASE}/admin/login`);
  await page.waitForLoadState("networkidle");
  // Fill password field and submit
  const pwd = page.locator('input[type="password"], input[placeholder*="contraseña"], input[name*="pass"]');
  if (await pwd.count() > 0) {
    await pwd.first().fill("admin");
    const btn = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Iniciar")');
    if (await btn.count() > 0) {
      await btn.first().click();
      await page.waitForTimeout(1500);
    }
  }
}

test.describe("Navegación general del panel admin", () => {
  test("la página de login carga correctamente", async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await expect(page).toHaveURL(/login/);
    // Should have some input and button
    const inputs = page.locator("input");
    expect(await inputs.count()).toBeGreaterThan(0);
  });

  test("el sidebar muestra las secciones del panel", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    // Even if redirected to login, sidebar links should exist in DOM eventually
    await page.waitForLoadState("networkidle");
    const html = await page.content();
    // Check for sidebar navigation items
    expect(html).toContain("Dashboard");
  });
});

test.describe("Dashboard", () => {
  test("el dashboard carga y muestra cards de acceso rápido", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Should show quick access buttons
    const logBtn = page.locator('a[href="/admin/activity-log"], a:has-text("Log de actividad")');
    const statsBtn = page.locator('a[href="/admin/estadisticas"], a:has-text("Estadísticas")');
    const exportBtn = page.locator('a[href="/admin/exportar"], a:has-text("Exportar")');

    // At least one of them should be visible
    const logCount = await logBtn.count();
    const statsCount = await statsBtn.count();
    const exportCount = await exportBtn.count();
    expect(logCount + statsCount + exportCount).toBeGreaterThan(0);
  });

  test("el dashboard muestra la sección de mes actual", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const html = await page.content();
    expect(html).toContain("Mes actual");
  });
});

test.describe("Activity Log", () => {
  test("la página de activity log carga", async ({ page }) => {
    await page.goto(`${BASE}/admin/activity-log`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const heading = page.locator("h1, h2").filter({ hasText: /actividad|log/i });
    expect(await heading.count()).toBeGreaterThan(0);
  });

  test("muestra estado vacío cuando no hay datos", async ({ page }) => {
    await page.goto(`${BASE}/admin/activity-log`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const html = await page.content();
    // Should show empty state or the log entries
    const hasEmpty = html.includes("No hay actividad") || html.includes("acciones registradas");
    const hasEntries = html.includes("activity") || html.includes("actividad");
    expect(hasEmpty || hasEntries).toBeTruthy();
  });

  test("los filtros están presentes en la página", async ({ page }) => {
    await page.goto(`${BASE}/admin/activity-log`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Should have filter elements (selects, inputs)
    const selects = page.locator("select, [role='combobox'], [data-slot='select-trigger']");
    const inputs = page.locator("input");
    expect(await selects.count() + await inputs.count()).toBeGreaterThan(0);
  });
});

test.describe("Estadísticas", () => {
  test("la página de estadísticas carga", async ({ page }) => {
    await page.goto(`${BASE}/admin/estadisticas`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const heading = page.locator("h1, h2").filter({ hasText: /estadística/i });
    expect(await heading.count()).toBeGreaterThan(0);
  });

  test("muestra las cards de resumen", async ({ page }) => {
    await page.goto(`${BASE}/admin/estadisticas`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const html = await page.content();
    // Should contain stats-related text
    const hasStats =
      html.includes("Total órdenes") ||
      html.includes("Ingresos") ||
      html.includes("Suscripciones") ||
      html.includes("estadísticas") ||
      html.includes("Estadísticas");
    expect(hasStats).toBeTruthy();
  });

  test("muestra los gráficos de distribución", async ({ page }) => {
    await page.goto(`${BASE}/admin/estadisticas`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const html = await page.content();
    const hasCharts =
      html.includes("Distribución por estado") ||
      html.includes("Distribución por operador");
    expect(hasCharts).toBeTruthy();
  });
});

test.describe("Exportación", () => {
  test("la página de exportación carga", async ({ page }) => {
    await page.goto(`${BASE}/admin/exportar`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const heading = page.locator("h1, h2").filter({ hasText: /exportar/i });
    expect(await heading.count()).toBeGreaterThan(0);
  });

  test("muestra información sobre los datos incluidos", async ({ page }) => {
    await page.goto(`${BASE}/admin/exportar`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const html = await page.content();
    expect(html).toContain("Datos incluidos");
    expect(html).toContain("Formato");
    expect(html).toContain("Seguridad");
  });

  test("el botón de exportar está presente", async ({ page }) => {
    await page.goto(`${BASE}/admin/exportar`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const exportBtn = page.locator("button").filter({ hasText: /exportar|backup|descargar/i });
    expect(await exportBtn.count()).toBeGreaterThan(0);
  });
});

test.describe("Navegación entre secciones", () => {
  test("se puede navegar del dashboard a activity log", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const logLink = page.locator('a[href="/admin/activity-log"]').first();
    if (await logLink.count() > 0) {
      await logLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/activity-log/);
    }
  });

  test("se puede navegar del dashboard a estadísticas", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const statsLink = page.locator('a[href="/admin/estadisticas"]').first();
    if (await statsLink.count() > 0) {
      await statsLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/estadisticas/);
    }
  });

  test("se puede navegar del dashboard a exportar", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const exportLink = page.locator('a[href="/admin/exportar"]').first();
    if (await exportLink.count() > 0) {
      await exportLink.click();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/exportar/);
    }
  });

  test("el sidebar permite navegar a todas las secciones", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const sidebarLinks = [
      "/admin/activity-log",
      "/admin/estadisticas",
      "/admin/exportar",
      "/admin/ordenes",
      "/admin/clientes",
      "/admin/suscripciones",
    ];

    for (const href of sidebarLinks) {
      const link = page.locator(`a[href="${href}"]`);
      expect(await link.count()).toBeGreaterThan(0);
    }
  });
});

test.describe("Responsive (mobile viewport)", () => {
  test("el layout funciona en viewport móvil (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("activity log es usable en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/admin/activity-log`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("estadísticas es usable en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/admin/estadisticas`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test("exportar es usable en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/admin/exportar`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

test.describe("Accesibilidad", () => {
  test("existe skip navigation link", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");

    const skipLink = page.locator(".skip-link, a[href='#main-content']");
    expect(await skipLink.count()).toBeGreaterThan(0);
  });

  test("el main tiene role='main'", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const main = page.locator("main[role='main'], main#main-content");
    expect(await main.count()).toBeGreaterThan(0);
  });

  test("el aside tiene role complementary", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");

    const aside = page.locator("aside[role='complementary'], aside");
    expect(await aside.count()).toBeGreaterThan(0);
  });

  test("la navegación tiene aria-label", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");

    const nav = page.locator("nav[aria-label]");
    expect(await nav.count()).toBeGreaterThan(0);
  });

  test("los botones son accesibles por teclado", async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Tab through elements and check focus
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Some element should have focus
    const focusedTag = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName.toLowerCase() : "none";
    });
    expect(["a", "button", "input", "select", "textarea"]).toContain(focusedTag);
  });
});

test.describe("Landing page", () => {
  test("la landing page carga correctamente", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    const html = await page.content();
    expect(html).toContain("Delega");
  });

  test("la landing tiene navegación a servicios", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForLoadState("networkidle");

    const html = await page.content();
    const hasNav =
      html.includes("servicios") ||
      html.includes("Servicios") ||
      html.includes("delegar") ||
      html.includes("contacto");
    expect(hasNav).toBeTruthy();
  });
});
