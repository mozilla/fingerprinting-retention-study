/* global browser, getStudySetup */

async function getStudySetup() {
  const studySetup = {
    activeExperimentName: browser.runtime.id,

    studyType: "shield",

    telemetry: {
      send: true,
      removeTestingFlag: true,
    },

    endings: { },

    expire: {
      days: 365,
    },
  };

  const res = await fetch(browser.extension.getURL("variations.json"));
  const variations = await res.json();
  studySetup.weightedVariations = Object.keys(variations).map(variation => {
    return {name: variation, weight: variations[variation].weight};
  });

  studySetup.allowEnroll = true;

  return studySetup;
}

async function init() {
  if (await browser.prefHelper.getAbortedPref()) {
    // We've been aborted externally. Nothing to do!
    return;
  }

  browser.study.onReady.addListener(async (studyInfo) => {
    await browser.multipreffer.studyReady(studyInfo);

    let channelCohortPrefix = studyInfo.variation.name === "Control" ? "c" : "t";

    // Set a pref containing our channel cohort prefix as a breadcrumb.
    // If needed in the future, this pref can be used to identify users
    // who were in this study and reveal the cohort they were assigned.
    await browser.prefHelper.setChannelCohortPrefixPref(channelCohortPrefix);

    let patternUS = "https://www.google.com/search?client=firefox-b-1-d&q=";
    let replacedUS = `https://www.google.com/search?client=firefox-b-1-d&channel=${channelCohortPrefix}us&q=`;
    let patternROW = "https://www.google.com/search?client=firefox-b-d&q=";
    let replacedROW = `https://www.google.com/search?client=firefox-b-d&channel=${channelCohortPrefix}row&q=`;

    function redirect(requestDetails) {
      if (requestDetails.url.startsWith(patternUS)) {
        return {
          redirectUrl: requestDetails.url.replace(patternUS, replacedUS),
        }
      }

      if (requestDetails.url.startsWith(patternROW)) {
        return {
          redirectUrl: requestDetails.url.replace(patternROW, replacedROW),
        }
      }

      return {};
    }

    let searchURLPattern = "https://www.google.com/search?client=firefox-b-*";

    browser.webRequest.onBeforeRequest.addListener(
      redirect, { urls: [ searchURLPattern ] }, [ "blocking" ]);
  });

  browser.study.onEndStudy.addListener(async (ending) => {
    browser.management.uninstallSelf();
  });

  await browser.study.setup(await getStudySetup());
}

init();
