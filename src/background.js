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

    let channelCohort = studyInfo.variation.name;

    // Set a pref containing our channel cohort as a breadcrumb.
    // If needed in the future, this pref can be used to identify users
    // who were in this study and reveal the cohort they were assigned.
    await browser.prefHelper.setChannelCohortPref(channelCohort);

  });

  browser.study.onEndStudy.addListener(async (ending) => {
    browser.management.uninstallSelf();
  });

  await browser.study.setup(await getStudySetup());
}

init();
