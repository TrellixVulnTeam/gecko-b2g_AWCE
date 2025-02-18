/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");
const { AppConstants } = ChromeUtils.import(
  "resource://gre/modules/AppConstants.jsm"
);

function MainProcessSingleton() {}
MainProcessSingleton.prototype = {
  classID: Components.ID("{0636a680-45cb-11e4-916c-0800200c9a66}"),
  QueryInterface: ChromeUtils.generateQI([
    "nsIObserver",
    "nsISupportsWeakReference",
  ]),

  observe(subject, topic, data) {
    switch (topic) {
      case "app-startup": {
        ChromeUtils.import(
          "resource://gre/modules/CustomElementsListener.jsm",
          null
        );

        Services.ppmm.loadProcessScript(
          "chrome://global/content/process-content.js",
          true
        );
        break;
      }
    }
  },
};

var EXPORTED_SYMBOLS = ["MainProcessSingleton"];
