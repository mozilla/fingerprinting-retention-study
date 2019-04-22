/* globals ExtensionAPI */

ChromeUtils.defineModuleGetter(this, "Preferences",
  "resource://gre/modules/Preferences.jsm");

this.prefHelper = class extends ExtensionAPI {
  getAPI(context) {
    return {
      prefHelper: {
        async getAbortedPref() {
          return Preferences.get("extensions.fp_retention_study.aborted");
        },
        async setBranchNamePref(aBranchName) {
          Preferences.set("extensions.fp_retention_study.branch_name", aBranchName);
        },
      },
    };
  }
};
