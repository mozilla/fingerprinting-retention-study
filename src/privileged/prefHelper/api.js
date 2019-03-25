/* globals ExtensionAPI */

ChromeUtils.defineModuleGetter(this, "Preferences",
  "resource://gre/modules/Preferences.jsm");

this.prefHelper = class extends ExtensionAPI {
  getAPI(context) {
    return {
      prefHelper: {
        async getAbortedPref() {
          return Preferences.get("extensions.etp_search_volume_study.aborted");
        },
        async setChannelCohortPrefixPref(aChannelCohortPrefix) {
          Preferences.set("extensions.etp_search_volume_study.channel_cohort_prefix", aChannelCohortPrefix);
        },
      },
    };
  }
};
