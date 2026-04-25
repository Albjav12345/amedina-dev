import client1 from '../assets/testimonials/client1.png';
import client2 from '../assets/testimonials/client2.png';
import client3 from '../assets/testimonials/client3.png';
import client4 from '../assets/testimonials/client4.png';

// -------------------------------------------------------------------------
// TESTIMONIALS CONFIGURATION
// Edit this file to manage the whole client feedback section.
//
// Quick guide:
// 1. Update `testimonialsSection` for the section heading.
// 2. Add or tweak a preset inside `testimonialSourcePresets`.
// 3. Add new entries inside `testimonialEntries`.
// 4. Add the testimonial id to `featuredTestimonialIds` if it should show
//    in the main marquee.
// -------------------------------------------------------------------------

const sanitizeReview = (review) => review.replace(/\s+/g, ' ').trim();

const parseStarRating = (value) => {
    if (!value) return null;

    const normalizedValue = String(value).replace('%', '').trim();
    if (!normalizedValue || ['n/a', 'na', 'null', 'none', '-', '--'].includes(normalizedValue.toLowerCase())) {
        return null;
    }

    const numericRating = Number(normalizedValue);
    if (!Number.isFinite(numericRating)) return null;

    return Math.max(1, Math.min(5, Math.round(numericRating / 20)));
};

const getServiceProfile = (gigTitle) => {
    const normalizedTitle = gigTitle.toLowerCase();

    if (normalizedTitle.includes('unity') && normalizedTitle.includes('ui toolkit')) {
        return {
            service: 'Unity UI / Game Systems',
            clientType: 'Game / Unity Client',
            avatarLabel: 'GS',
            avatarGradient: 'linear-gradient(135deg, rgba(15, 255, 153, 0.28) 0%, rgba(102, 252, 241, 0.2) 55%, rgba(11, 12, 16, 0.96) 100%)',
            avatarAccent: 'rgba(15, 255, 153, 0.36)',
        };
    }

    if (normalizedTitle.includes('unity')) {
        return {
            service: 'Unity UI / Editor Tools',
            clientType: 'Game / Unity Client',
            avatarLabel: 'UI',
            avatarGradient: 'linear-gradient(135deg, rgba(102, 252, 241, 0.24) 0%, rgba(15, 255, 153, 0.16) 52%, rgba(11, 12, 16, 0.96) 100%)',
            avatarAccent: 'rgba(102, 252, 241, 0.34)',
        };
    }

    if (normalizedTitle.includes('seo')) {
        return {
            service: 'Automation / SEO Workflow',
            clientType: 'SEO / Content Operations',
            avatarLabel: 'SEO',
            avatarGradient: 'linear-gradient(135deg, rgba(15, 255, 153, 0.26) 0%, rgba(41, 196, 255, 0.14) 48%, rgba(11, 12, 16, 0.96) 100%)',
            avatarAccent: 'rgba(15, 255, 153, 0.28)',
        };
    }

    return {
        service: 'Automation / Metadata Workflow',
        clientType: 'Operations / Media Client',
        avatarLabel: 'OPS',
        avatarGradient: 'linear-gradient(135deg, rgba(102, 252, 241, 0.22) 0%, rgba(15, 255, 153, 0.15) 50%, rgba(11, 12, 16, 0.96) 100%)',
        avatarAccent: 'rgba(102, 252, 241, 0.3)',
    };
};

export const testimonialsSection = {
    title: 'Verified Client Feedback',
    subtitle: 'Real client feedback collected from completed projects.',
};

export const testimonialSourcePresets = {
    fiverr: {
        source: 'Fiverr',
        label: 'Verified Fiverr Client',
        clientName: 'Fiverr Client',
        orderLabel: 'From completed Fiverr order',
    },
    direct: {
        source: 'Direct Client',
        label: 'Verified Client',
        clientName: 'Private Client',
        orderLabel: 'From completed client project',
    },
};

export const featuredTestimonialIds = [
    'unity-progress-communication',
    'automation-seo-detail',
    'unity-complex-ownership',
    'automation-exceeded-expectations',
    'unity-fast-delivery',
    'automation-communication-timelines',
];

const featuredIds = new Set(featuredTestimonialIds);
const generatedAvatarPool = [client1, client2, client3, client4];

const getGeneratedAvatar = (testimonialId) => {
    const hash = testimonialId.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
    return generatedAvatarPool[hash % generatedAvatarPool.length];
};

export const testimonialEntries = [
    {
        id: 'unity-progress-communication',
        sourceKey: 'fiverr',
        gigTitle: 'create professional unity editor windows or game uis with uxml',
        createdAt: '2024-06-16T19:22:08Z',
        starRating: null,
        review: "It's been a pleasure working with Alberto. He has been great at communicating the the progress of the project, sharing updates and asking for feedback to ensure requirements where meet. He has been pleasant to work with and delivered a very professional job. Will definitely recommend for UI Unity projects and hope to work with again.",
    },
    {
        id: 'unity-fast-delivery',
        sourceKey: 'fiverr',
        gigTitle: 'create professional unity editor windows or game uis with uxml',
        createdAt: '2024-07-02T16:25:00Z',
        starRating: null,
        review: 'Very professional job. Sent timely updates during the project. Asked for clarification when needed and delivered sooner than we originally agreed.',
    },
    {
        id: 'unity-communication',
        sourceKey: 'fiverr',
        gigTitle: 'create professional unity editor windows or game uis with uxml',
        createdAt: '2024-07-05T20:42:58Z',
        starRating: null,
        review: 'Great work and great communication.',
    },
    {
        id: 'unity-great-work',
        sourceKey: 'fiverr',
        gigTitle: 'create professional unity editor windows or game uis with uxml',
        createdAt: '2024-07-21T14:05:57Z',
        starRating: null,
        review: 'Great work!',
    },
    {
        id: 'unity-complex-ownership',
        sourceKey: 'fiverr',
        gigTitle: 'create professional unity game uis or editor windows with ui toolkit',
        createdAt: '2024-07-29T16:57:35Z',
        starRating: null,
        review: "Much better than expected. He did a good job with somewhat complex tasks and overcame them quite well. He has not only limited himself to the main stuff, but contributed with ideas and helped me in other aspects of the project. He's done his work against the clock, with commitment and eagerness to do a well done job, so I hope we could work soon again together!",
    },
    {
        id: 'unity-repeat-client',
        sourceKey: 'fiverr',
        gigTitle: 'create professional unity game uis or editor windows with ui toolkit',
        createdAt: '2024-09-27T19:47:17Z',
        starRating: null,
        review: 'Great work as always',
    },
    {
        id: 'automation-seo-detail',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for easy gallery managing',
        createdAt: '2024-11-07T20:02:11Z',
        starRating: null,
        review: 'I had a fantastic experience working with this professional. The attention to detail in optimizing my images for SEO, including the meticulous work with geotags, keywords, and descriptions, was exceptional. Every instruction I provided was followed precisely, and the final files were delivered in perfect order. Highly recommended for anyone looking to enhance their visual content for better search engine performance. I will definitely use their services again!',
    },
    {
        id: 'automation-exceeded-expectations',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for gallery and seo managing',
        createdAt: '2024-11-08T22:07:56Z',
        starRating: null,
        review: 'Alberto Medina truly exceeded my expectations with his attention to detail and professionalism. Working with him was a pleasure; he was cooperative, went above and beyond, and remained polite throughout. Highly recommend! \u{1F44F}',
    },
    {
        id: 'automation-gallery-spanish',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for gallery and seo managing',
        createdAt: '2024-11-09T18:29:07Z',
        starRating: null,
        review: 'Muy satisfecho con el servicio. Este vendedor hizo un excelente trabajo ajustando los metadatos de 30 fotos para que se ordenen correctamente en mi galer\u00eda. Fue r\u00e1pido y eficiente, justo lo que necesitaba. Estar\u00e9 encantado de volver a trabajar con el en un futuro!',
    },
    {
        id: 'automation-fiverr-credit',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for gallery and seo managing',
        createdAt: '2024-11-19T14:13:23Z',
        starRating: null,
        review: 'Alberto is a real credit to Fiverr. Exceptional talent. Highly recommended. Hope to work with him again.',
    },
    {
        id: 'automation-outstanding-work',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for gallery and seo managing',
        createdAt: '2024-12-08T08:55:41Z',
        starRating: null,
        review: 'Thank you very much, I am surprised by the very, very good work, it exceeded my expectations. I will let Alberto do more projects. Thanks again for your outstanding work!',
    },
    {
        id: 'automation-communication-timelines',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for gallery and seo managing',
        createdAt: '2024-12-12T19:03:03Z',
        starRating: null,
        review: 'Alberto is exceptional, quick understanding, excellent communication and meeting expectations and timelines. He did any revisions needed with no hassle. Highly recommended.',
    },
    {
        id: 'automation-wonderful-details',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for gallery and seo managing',
        createdAt: '2024-12-15T18:18:51Z',
        starRating: null,
        review: 'Wonderful details',
    },
    {
        id: 'automation-vigor',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for seo and gallery managing',
        createdAt: '2025-01-06T09:56:00Z',
        starRating: null,
        review: 'Handled the task with vigor',
    },
    {
        id: 'automation-fast-turnaround',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for seo and gallery managing',
        createdAt: '2025-01-06T17:58:51Z',
        starRating: null,
        review: 'Good job and fast',
    },
    {
        id: 'automation-highly-recommend',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for seo and gallery managing',
        createdAt: '2025-01-30T18:59:30Z',
        starRating: null,
        review: "He's great. I highly recommend",
    },
    {
        id: 'automation-nice-guy',
        sourceKey: 'fiverr',
        gigTitle: 'edit photos and videos metadata for seo and gallery managing',
        createdAt: '2025-01-31T10:10:16Z',
        starRating: null,
        review: 'Nice guy he does his work good! Go check him out guys',
    },
];

export const allTestimonials = testimonialEntries
    .map((entry) => {
        const serviceProfile = getServiceProfile(entry.gigTitle);
        const sourcePreset = testimonialSourcePresets[entry.sourceKey] ?? testimonialSourcePresets.direct;
        const confirmedRating = parseStarRating(entry.starRating);

        return {
            id: entry.id,
            source: sourcePreset.source,
            label: sourcePreset.label,
            orderLabel: sourcePreset.orderLabel,
            review: sanitizeReview(entry.review),
            service: serviceProfile.service,
            clientName: entry.clientName ?? sourcePreset.clientName,
            clientType: entry.clientType ?? serviceProfile.clientType,
            avatarType: 'generated-photo',
            avatarUrl: entry.avatarUrl ?? getGeneratedAvatar(entry.id),
            avatarLabel: entry.avatarLabel ?? serviceProfile.avatarLabel,
            avatarGradient: entry.avatarGradient ?? serviceProfile.avatarGradient,
            avatarAccent: entry.avatarAccent ?? serviceProfile.avatarAccent,
            rating: confirmedRating ?? 5,
            hasConfirmedRating: confirmedRating !== null,
            createdAt: entry.createdAt,
            featured: featuredIds.has(entry.id),
        };
    })
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

export const featuredTestimonials = featuredTestimonialIds
    .map((testimonialId) => allTestimonials.find((testimonial) => testimonial.id === testimonialId))
    .filter(Boolean);

// Backwards-compatible aliases in case another part of the app still imports
// the old Fiverr-specific names.
export const fiverrTestimonialsSection = testimonialsSection;
export const allFiverrTestimonials = allTestimonials;
export const featuredFiverrTestimonials = featuredTestimonials;
