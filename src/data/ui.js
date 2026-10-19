import portfolioContent from './generated/portfolioContent.json' with { type: 'json' };

const content = portfolioContent.runtime.ui;
const cvHref = content.hero.buttons.cvHref;

export const ui = {
    ...content,
    hero: {
        ...content.hero,
        buttons: {
            ...content.hero.buttons,
            cvHref: cvHref === '/Alberto_Medina_CV_2026.pdf'
                ? `${cvHref}?v=${__CV_PDF_VERSION__}`
                : cvHref,
        },
    },
};
