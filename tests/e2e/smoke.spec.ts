import { credentials, expect, submitLogin, test } from "./fixtures";

test("login page renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Welcome to TIR" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("wrong password is rejected", async ({ page }) => {
  const admin = credentials("admin");
  await submitLogin(page, { ...admin, password: `${admin.password}-wrong` });
  await expect(page.getByRole("dialog")).toContainText("Login Unsuccessful");
  await expect(page).toHaveURL(/\/$/);
});

test("admin lands on the dashboard with administration", async ({ adminPage }) => {
  await expect(adminPage.getByRole("heading", { name: "Test Ingest Repository." })).toBeVisible();
  await expect(adminPage.getByRole("link", { name: "Administration" }).first()).toBeVisible();
});

test("user lands on the dashboard without administration", async ({ userPage }) => {
  await expect(userPage.getByRole("heading", { name: "Test Ingest Repository." })).toBeVisible();
  await expect(userPage.getByRole("link", { name: "Boundaries" }).first()).toBeVisible();
  await expect(userPage.getByRole("link", { name: "Administration" })).toHaveCount(0);
});

test("boundaries page renders", async ({ adminPage }) => {
  await adminPage.goto("/company-boundary");
  const heading = adminPage.getByRole("heading", {
    name: /STIG Library & CCI Matrix Required|Boundaries/,
  });
  await expect(heading.first()).toBeVisible();
});

test("libraries page renders", async ({ adminPage }) => {
  await adminPage.goto("/libraries");
  await expect(adminPage.getByRole("heading", { name: "STIG Libraries" })).toBeVisible();
  await expect(adminPage.getByRole("heading", { name: "CCI Matrix" })).toBeVisible();
});

test("sign out returns to login and ends the session", async ({ adminPage }) => {
  await adminPage.getByRole("button", { name: "Open user menu" }).click();
  await adminPage.getByRole("menuitem", { name: "Sign out" }).click();
  await adminPage.waitForURL(/\/$/);
  await expect(adminPage.getByRole("button", { name: "Sign in" })).toBeVisible();
  const whoami = await adminPage.request.get("/api/auth/currentUser");
  expect(whoami.status()).toBe(401);
});
