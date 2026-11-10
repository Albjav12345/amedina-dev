import portfolioContent from '../data/generated/portfolioContent.json' with { type: 'json' };

export const siteFeatures = portfolioContent.runtime.siteFeatures;

export const isArchitectSectionEnabled = siteFeatures.architectSection;

// Keep the panel implementation available, but exclude its entry points and
// lazy-loaded module from the website while this build-time switch is off.
export const isControlPanelEnabled = false;
