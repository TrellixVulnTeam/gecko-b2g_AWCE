/* Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function open_close_dialog() {
  mockShell();

  await showAndWaitForDialog();

  Assert.ok(true, "Upgrade dialog opened and closed");
});

add_task(async function theme_change() {
  const theme = await AddonManager.getAddonByID(
    "foto-soft-colorway@mozilla.org"
  );

  await showAndWaitForDialog(async win => {
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "variations");
    win.document.querySelectorAll("[name=theme]")[3].click();
    await TestUtils.waitForCondition(() => theme.isActive, "Theme is active");
    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.close();
  });

  Assert.ok(theme.isActive, "Theme change saved");
  theme.disable();
});

add_task(async function keyboard_focus_okay() {
  await showAndWaitForDialog(async win => {
    await BrowserTestUtils.waitForEvent(win, "ready");
    Assert.equal(
      win.document.activeElement,
      win.document.getElementById("primary"),
      "Primary button has focus"
    );

    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    Assert.equal(
      win.document.activeElement.name,
      "theme",
      "A theme radio button has focus"
    );

    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    Assert.equal(
      win.document.activeElement,
      win.document.getElementById("primary"),
      "Primary button has focus"
    );

    win.close();
  });
});

add_task(async function keep_home() {
  Services.prefs.setStringPref("browser.startup.homepage", "about:blank");

  await showAndWaitForDialog(async win => {
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");

    // Click the pre-selected checkbox to keep custom homepage.
    win.document.getElementById("checkbox").click();
    win.document.getElementById("secondary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.close();
  });

  Assert.ok(
    Services.prefs.prefHasUserValue("browser.startup.homepage"),
    "Homepage kept"
  );
});

add_task(async function revert_home() {
  await showAndWaitForDialog(async win => {
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("secondary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.close();
  });

  Assert.ok(
    !Services.prefs.prefHasUserValue("browser.startup.homepage"),
    "Homepage reverted"
  );
});

add_task(async function revert_newtab() {
  Services.telemetry.clearEvents();
  Services.prefs.setBoolPref("browser.newtabpage.enabled", false);

  await showAndWaitForDialog(async win => {
    // Always "randomly" select the first colorway.
    win.Math.random = () => 0;

    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("secondary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.close();
  });

  Assert.ok(
    !Services.prefs.prefHasUserValue("browser.newtabpage.enabled"),
    "New tab reverted"
  );
  AssertEvents(
    "Checkbox shown and kept checked",
    ["content", "show", "3-screens"],
    ["content", "show", "upgrade-dialog-start-primary-button"],
    ["content", "button", "upgrade-dialog-start-primary-button"],
    ["content", "show", "random-1"],
    ["content", "show", "upgrade-dialog-colorway-home-checkbox"],
    ["content", "show", "upgrade-dialog-colorway-primary-button"],
    ["content", "button", "upgrade-dialog-colorway-secondary-button"],
    ["content", "button", "upgrade-dialog-colorway-home-checkbox"],
    ["content", "show", "upgrade-dialog-thankyou-primary-button"],
    ["content", "close", "external"]
  );
});

add_task(async function skip_screens() {
  await showAndWaitForDialog(async win => {
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("secondary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("primary").click();
  });

  AssertEvents(
    "Skipped over colorway screen",
    ["content", "show", "3-screens"],
    ["content", "show", "upgrade-dialog-start-primary-button"],
    ["content", "button", "upgrade-dialog-start-secondary-button"],
    ["content", "show", "upgrade-dialog-thankyou-primary-button"],
    ["content", "button", "upgrade-dialog-thankyou-primary-button"],
    ["content", "close", "complete"]
  );
});

add_task(async function all_3_screens() {
  await showAndWaitForDialog(async win => {
    // Always "randomly" select the first colorway.
    win.Math.random = () => 0;

    await BrowserTestUtils.waitForEvent(win, "ready");
    win.document.getElementById("primary").click();
    await BrowserTestUtils.waitForEvent(win, "variations");
    win.document.querySelectorAll("[name=variation]")[1].click();
    win.document.getElementById("secondary").click();
    await BrowserTestUtils.waitForEvent(win, "ready");
    win.close();
  });

  AssertEvents(
    "Shows all 3 screens with variations",
    ["content", "show", "3-screens"],
    ["content", "show", "upgrade-dialog-start-primary-button"],
    ["content", "button", "upgrade-dialog-start-primary-button"],
    ["content", "show", "random-1"],
    ["content", "show", "upgrade-dialog-colorway-primary-button"],
    ["content", "theme", "balanced"],
    ["content", "button", "upgrade-dialog-colorway-secondary-button"],
    ["content", "show", "upgrade-dialog-thankyou-primary-button"],
    ["content", "close", "external"]
  );
});

add_task(async function quit_app() {
  await showAndWaitForDialog(async win => {
    await BrowserTestUtils.waitForEvent(win, "ready");
    const cancelled = Cc["@mozilla.org/supports-PRBool;1"].createInstance(
      Ci.nsISupportsPRBool
    );
    cancelled.data = true;
    Services.obs.notifyObservers(
      cancelled,
      "quit-application-requested",
      "test"
    );
  });

  AssertEvents(
    "Dialog closed on quit request",
    ["content", "show", "3-screens"],
    ["content", "show", "upgrade-dialog-start-primary-button"],
    ["content", "close", "quit-application-requested"]
  );
});

add_task(async function window_warning() {
  // Dismiss the alert when it opens.
  const warning = BrowserTestUtils.promiseAlertDialog("cancel");

  await showAndWaitForDialog(async win => {
    await BrowserTestUtils.waitForEvent(win, "ready");

    // Show close warning without blocking to allow this callback to complete.
    setTimeout(() => gBrowser.warnAboutClosingTabs());
  });
  await warning;

  AssertEvents(
    "Dialog closed when close warning wants to open",
    ["content", "show", "3-screens"],
    ["content", "show", "upgrade-dialog-start-primary-button"],
    ["content", "close", "external"]
  );
});
