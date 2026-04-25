import portfolioContent from '../data/generated/portfolioContent.json' with { type: 'json' };

export const siteFeatures = portfolioContent.runtime.siteFeatures;

export const isArchitectSectionEnabled = siteFeatures.architectSection;
