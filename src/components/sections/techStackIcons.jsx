import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    siFirebase,
    siFramer,
    siGit,
    siGithub,
    siMongodb,
    siMeta,
    siNodedotjs,
    siOpenapiinitiative,
    siPostgresql,
    siPostman,
    siPython,
    siReact,
    siSelenium,
    siSharp,
    siSupabase,
    siTailwindcss,
    siUnity,
    siVercel,
    siVite,
} from 'simple-icons';

const ICON_SIZE_CLASSES = {
    item: 'w-[18px] h-[18px] shrink-0',
    category: 'w-[16px] h-[16px] shrink-0',
};

const ICON_SLIDE_OFFSETS = {
    item: 9,
    category: 7,
};

const ROTATION_INTERVAL_MS = 1850;
const QUICK_EASE_OUT = [0.16, 1, 0.3, 1];
const QUICK_EASE_IN = [0.4, 0, 1, 1];

const ICON_TUNING = {
    python: {
        item: { scale: 1.02, y: 0.15 },
        category: { scale: 1.08, y: 0.15 },
    },
    csharp: {
        item: { scale: 0.94, y: 0.2 },
        category: { scale: 1, y: 0.2 },
    },
    postgres: {
        item: { scale: 1.04, y: 0.15 },
        category: { scale: 1.1, y: 0.15 },
    },
    mongodb: {
        item: { scale: 1.3, y: 0.15 },
        category: { scale: 1.36, y: 0.15 },
    },
    nodejs: {
        item: { scale: 0.98, y: 0.1 },
        category: { scale: 1.04, y: 0.1 },
    },
    multithreading: {
        item: { scale: 1.08 },
    },
    openapi: {
        item: { scale: 1.08 },
        category: { scale: 1.14 },
    },
    groq: {
        item: { scale: 1.12, x: -0.1 },
        category: { scale: 1.18, x: -0.1 },
    },
    meta: {
        item: { scale: 1.16, y: 0.1 },
        category: { scale: 1.22, y: 0.1 },
    },
    tesseract: {
        item: { scale: 1.12 },
        category: { scale: 1.18 },
    },
    selenium: {
        item: { scale: 0.96, y: 0.1 },
        category: { scale: 1.02, y: 0.1 },
    },
    'data-processing': {
        item: { scale: 1.1 },
    },
    inference: {
        item: { scale: 1.12 },
    },
    react: {
        item: { scale: 1.08 },
        category: { scale: 1.14 },
    },
    unity: {
        item: { scale: 1.04 },
        category: { scale: 1.1 },
    },
    tailwind: {
        item: { scale: 1.18, y: 0.1 },
        category: { scale: 1.24, y: 0.1 },
    },
    framer: {
        item: { scale: 1.08 },
        category: { scale: 1.14 },
    },
    shader: {
        item: { scale: 1.18 },
    },
    firebase: {
        item: { scale: 1.14, y: 0.2 },
        category: { scale: 1.2, y: 0.2 },
    },
    supabase: {
        item: { scale: 1.08, y: 0.1 },
        category: { scale: 1.14, y: 0.1 },
    },
    git: {
        item: { scale: 1.02 },
        category: { scale: 1.08 },
    },
    github: {
        item: { scale: 1.08, y: 0.1 },
        category: { scale: 1.14, y: 0.1 },
    },
    vercel: {
        item: { scale: 1.28, y: 0.2 },
        category: { scale: 1.34, y: 0.2 },
    },
    vite: {
        item: { scale: 1.18, y: 0.1 },
        category: { scale: 1.24, y: 0.1 },
    },
    postman: {
        item: { scale: 1.14, y: 0.1 },
        category: { scale: 1.2, y: 0.1 },
    },
    default: {
        item: { scale: 1 },
        category: { scale: 1 },
    },
};

const TECH_ITEM_ICON_TOKENS = {
    'Python': ['python'],
    'C#': ['csharp'],
    'SQL / NoSQL': ['postgres', 'mongodb'],
    'Node.js': ['nodejs'],
    'Multithreading': ['multithreading'],
    'API Design': ['openapi'],
    'Groq (Llama 3)': ['groq', 'meta'],
    'Tesseract OCR': ['tesseract'],
    'Selenium': ['selenium'],
    'Data Processing': ['data-processing'],
    'Inference': ['inference'],
    'React': ['react'],
    'Unity 3D': ['unity'],
    'Tailwind CSS': ['tailwind'],
    'Motion Design': ['framer'],
    'HLSL Shaders': ['shader'],
    'Firebase': ['firebase'],
    'Supabase': ['supabase'],
    'Git / GitHub': ['git', 'github'],
    'Vercel': ['vercel'],
    'Vite': ['vite'],
    'Postman': ['postman'],
};

const TECH_CATEGORY_ICON_TOKENS = {
    'Core Development': ['python', 'csharp', 'nodejs'],
    'AI & Vision Workflows': ['groq', 'tesseract', 'selenium'],
    'Frontend & Interactive Systems': ['react', 'unity', 'tailwind', 'framer'],
    'Infra & Delivery': ['supabase', 'github', 'vercel', 'vite'],
};

function getIconTuning(token, size) {
    return ICON_TUNING[token]?.[size] || ICON_TUNING[token]?.item || ICON_TUNING.default[size];
}

function getRotationOffset(label) {
    return Array.from(label).reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0) % 900;
}

function SvgIconFrame({ viewBox = '0 0 24 24', children }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            fill="none"
            className="w-full h-full"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

function BalancedIcon({ token, size = 'item', children }) {
    const tuning = getIconTuning(token, size);

    return (
        <span className={`inline-flex items-center justify-center ${ICON_SIZE_CLASSES[size]}`} aria-hidden="true">
            <span
                className="inline-flex items-center justify-center w-full h-full"
                style={{
                    transform: `translate(${tuning.x || 0}px, ${tuning.y || 0}px) scale(${tuning.scale || 1})`,
                    transformOrigin: 'center center',
                }}
            >
                {children}
            </span>
        </span>
    );
}

function BrandIcon({ icon, token, size = 'item' }) {
    return (
        <BalancedIcon token={token} size={size}>
            <SvgIconFrame>
                <path d={icon.path} fill="currentColor" />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function GroqIcon({ size = 'item' }) {
    return (
        <BalancedIcon token="groq" size={size}>
            <SvgIconFrame viewBox="0 0 498.82 299.17">
                <path
                    d="M297.32,111.54h-.01c-36.59,0-66.36,29.77-66.36,66.36s29.77,66.36,66.36,66.36,66.36-29.77,66.36-66.38c-.06-36.52-29.83-66.29-66.35-66.35ZM328.47,177.9c0,17.19-13.98,31.17-31.17,31.17s-31.17-13.98-31.17-31.17,13.98-31.17,31.17-31.17,31.17,13.98,31.17,31.17Z"
                    fill="currentColor"
                />
                <path
                    d="M140.69,171.78c.14-3.92.48-7.72,1.22-11.58l.02-.08c.95-4.55,2.39-8.92,4.28-13.02,3.94-8.38,9.75-15.76,16.83-21.38,6.94-5.47,15.06-9.55,23.5-11.8,4.14-1.15,8.42-1.89,12.74-2.2,9.56-.69,19.01.38,28.01,3.75,3.33,1.25,6.66,2.83,9.77,4.63l5.27,3.06-16.9,29.39-5.27-2.94c-3.65-2.04-7.6-3.29-11.74-3.71-4.33-.39-8.8,0-13,1.15-3.97,1.06-7.76,2.98-10.97,5.55-3,2.42-5.43,5.51-7,8.92-1.7,3.67-2.33,7.72-2.33,11.74v66.49h-34.43v-68Z"
                    fill="currentColor"
                />
                <path
                    d="M128.73,174.02c-.42-16.82-7.27-32.55-19.29-44.31-12.01-11.74-27.87-18.23-44.65-18.27h-.54C29.19,111.44.51,139.87.21,175.07c-.15,17.14,6.36,33.33,18.35,45.57,11.99,12.25,28,19.07,45.14,19.22h19.53v-34.01h-18.55c-8.04.11-15.64-2.96-21.39-8.59-5.75-5.63-8.97-13.18-9.06-21.26-.18-16.65,13.15-30.35,29.73-30.55h.8c16.55,0,30.09,13.55,30.19,30.17v59.37c0,16.43-13.37,29.96-29.82,30.17-7.88-.06-15.28-3.19-20.84-8.82l-4.32-4.36-.02.02-17.35,30.65c11.58,10.57,26.42,16.41,42.16,16.53h.87c16.88-.24,32.71-6.99,44.58-19.02,11.86-12.02,18.45-27.97,18.54-44.94v-61.19h-.02Z"
                    fill="currentColor"
                />
                <path
                    d="M434.93,111.54c-17.14,0-33.24,6.68-45.35,18.82-12.09,12.12-18.73,28.22-18.7,45.32,0,35.34,28.73,64.09,64.05,64.09h18.17v-33.96h-18.17c-16.6,0-30.11-13.51-30.11-30.13s13.51-30.13,30.11-30.13c7.54,0,14.77,2.82,20.34,7.93,5.38,4.94,9.61,11.56,9.61,18.85v122.74h33.94v-119.4c0-35.37-28.66-64.15-63.89-64.15Z"
                    fill="currentColor"
                />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function TesseractIcon({ size = 'item' }) {
    return (
        <BalancedIcon token="tesseract" size={size}>
            <SvgIconFrame viewBox="0 0 48 48">
                <path
                    d="M7.66,22.0588H40.34a3.16,3.16,0,0,1,3.16,3.16v10.2a3.16,3.16,0,0,1-3.16,3.16H7.66a3.16,3.16,0,0,1-3.16-3.16v-10.2A3.16,3.16,0,0,1,7.66,22.0588Z"
                    stroke="currentColor"
                    strokeWidth="2.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M40.32,22.0631,5.37,9.4212"
                    stroke="currentColor"
                    strokeWidth="2.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <rect
                    x="17.2363"
                    y="28.1436"
                    width="22.338"
                    height="4.3504"
                    stroke="currentColor"
                    strokeWidth="2.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <rect
                    x="8.3367"
                    y="28.1436"
                    width="4.3435"
                    height="4.3504"
                    stroke="currentColor"
                    strokeWidth="2.15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function MultithreadingIcon({ size = 'item' }) {
    return (
        <BalancedIcon token="multithreading" size={size}>
            <SvgIconFrame>
                <circle cx="6" cy="7" r="1.8" fill="currentColor" />
                <circle cx="18" cy="7" r="1.8" fill="currentColor" />
                <circle cx="6" cy="17" r="1.8" fill="currentColor" />
                <circle cx="18" cy="17" r="1.8" fill="currentColor" />
                <path
                    d="M7.8 7h4.6c2.1 0 3.8 1.7 3.8 3.8V13M7.8 17h4.8c2 0 3.7-1.5 3.8-3.5V11M16 13h.2"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function DataProcessingIcon({ size = 'item' }) {
    return (
        <BalancedIcon token="data-processing" size={size}>
            <SvgIconFrame>
                <rect x="4.5" y="6" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.9" />
                <rect x="12.5" y="10" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.9" />
                <rect x="4.5" y="14" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.9" />
                <path
                    d="M11.5 8h2.6M15.5 10V8M12.5 16H10"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function InferenceIcon({ size = 'item' }) {
    return (
        <BalancedIcon token="inference" size={size}>
            <SvgIconFrame>
                <circle cx="7" cy="7" r="1.8" fill="currentColor" />
                <circle cx="7" cy="17" r="1.8" fill="currentColor" />
                <circle cx="13" cy="12" r="1.8" fill="currentColor" />
                <path
                    d="M8.6 7.8 11.6 10.7M8.6 16.2l3-2.9M14.8 12H19m-2-2 2 2-2 2"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function ShaderIcon({ size = 'item' }) {
    return (
        <BalancedIcon token="shader" size={size}>
            <SvgIconFrame>
                <path
                    d="M12 4.5 5.5 8.2v7.6l6.5 3.7 6.5-3.7V8.2L12 4.5Z"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinejoin="round"
                />
                <path
                    d="m9.1 9.4 2.9 2.6 2.9-2.6M12 12v7.2"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="m18.2 4.2.95 1.95 1.95.95-1.95.95-.95 1.95-.95-1.95-1.95-.95 1.95-.95.95-1.95Z"
                    fill="currentColor"
                />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function DefaultTechIcon({ size = 'item' }) {
    return (
        <BalancedIcon token="default" size={size}>
            <SvgIconFrame>
                <path
                    d="M8.5 7 4 12l4.5 5M15.5 7 20 12l-4.5 5M13.2 4.8 10.8 19.2"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </SvgIconFrame>
        </BalancedIcon>
    );
}

function renderTokenIcon(token, size = 'item') {
    switch (token) {
        case 'python':
            return <BrandIcon icon={siPython} token="python" size={size} />;
        case 'csharp':
            return <BrandIcon icon={siSharp} token="csharp" size={size} />;
        case 'postgres':
            return <BrandIcon icon={siPostgresql} token="postgres" size={size} />;
        case 'mongodb':
            return <BrandIcon icon={siMongodb} token="mongodb" size={size} />;
        case 'nodejs':
            return <BrandIcon icon={siNodedotjs} token="nodejs" size={size} />;
        case 'multithreading':
            return <MultithreadingIcon size={size} />;
        case 'openapi':
            return <BrandIcon icon={siOpenapiinitiative} token="openapi" size={size} />;
        case 'groq':
            return <GroqIcon size={size} />;
        case 'meta':
            return <BrandIcon icon={siMeta} token="meta" size={size} />;
        case 'tesseract':
            return <TesseractIcon size={size} />;
        case 'selenium':
            return <BrandIcon icon={siSelenium} token="selenium" size={size} />;
        case 'data-processing':
            return <DataProcessingIcon size={size} />;
        case 'inference':
            return <InferenceIcon size={size} />;
        case 'react':
            return <BrandIcon icon={siReact} token="react" size={size} />;
        case 'unity':
            return <BrandIcon icon={siUnity} token="unity" size={size} />;
        case 'tailwind':
            return <BrandIcon icon={siTailwindcss} token="tailwind" size={size} />;
        case 'framer':
            return <BrandIcon icon={siFramer} token="framer" size={size} />;
        case 'shader':
            return <ShaderIcon size={size} />;
        case 'firebase':
            return <BrandIcon icon={siFirebase} token="firebase" size={size} />;
        case 'supabase':
            return <BrandIcon icon={siSupabase} token="supabase" size={size} />;
        case 'git':
            return <BrandIcon icon={siGit} token="git" size={size} />;
        case 'github':
            return <BrandIcon icon={siGithub} token="github" size={size} />;
        case 'vercel':
            return <BrandIcon icon={siVercel} token="vercel" size={size} />;
        case 'vite':
            return <BrandIcon icon={siVite} token="vite" size={size} />;
        case 'postman':
            return <BrandIcon icon={siPostman} token="postman" size={size} />;
        default:
            return <DefaultTechIcon size={size} />;
    }
}

function SlidingIconSequence({ tokens, size = 'item', quality, label }) {
    const shouldAnimate = tokens.length > 1 && quality?.tier !== 'low';
    const [activeIndex, setActiveIndex] = useState(0);
    const slideOffset = ICON_SLIDE_OFFSETS[size] || ICON_SLIDE_OFFSETS.item;

    useEffect(() => {
        if (!shouldAnimate) {
            setActiveIndex(0);
            return undefined;
        }

        let intervalId;
        const initialDelay = 950 + getRotationOffset(label);

        const timeoutId = setTimeout(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % tokens.length);
            intervalId = setInterval(() => {
                setActiveIndex((currentIndex) => (currentIndex + 1) % tokens.length);
            }, ROTATION_INTERVAL_MS);
        }, initialDelay);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [label, shouldAnimate, tokens.length]);

    if (!tokens.length) {
        return <DefaultTechIcon size={size} />;
    }

    if (!shouldAnimate) {
        return renderTokenIcon(tokens[0], size);
    }

    const activeToken = tokens[activeIndex];

    return (
        <span className={`relative inline-flex items-center justify-center overflow-visible ${ICON_SIZE_CLASSES[size]}`} aria-hidden="true">
            <span className="opacity-0 pointer-events-none">{renderTokenIcon(tokens[0], size)}</span>

            <AnimatePresence initial={false} mode="sync">
                <motion.span
                    key={`${label}-${activeToken}-${activeIndex}`}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ x: -slideOffset, opacity: 0, scale: 0.92, filter: 'blur(4px)' }}
                    animate={{
                        x: 0,
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)',
                        transition: {
                            duration: 0.28,
                            ease: QUICK_EASE_OUT,
                        },
                    }}
                    exit={{
                        x: slideOffset,
                        opacity: 0,
                        scale: 0.96,
                        filter: 'blur(4px)',
                        transition: {
                            duration: 0.16,
                            ease: QUICK_EASE_IN,
                        },
                    }}
                >
                    {renderTokenIcon(activeToken, size)}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

export function renderTechItemIcon(name, quality) {
    return (
        <SlidingIconSequence
            tokens={TECH_ITEM_ICON_TOKENS[name] || ['default']}
            size="item"
            quality={quality}
            label={`item-${name}`}
        />
    );
}

export function renderTechCategoryIcon(title, quality) {
    return (
        <SlidingIconSequence
            tokens={TECH_CATEGORY_ICON_TOKENS[title] || ['default']}
            size="category"
            quality={quality}
            label={`category-${title}`}
        />
    );
}
