import React from 'react';
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

const ITEM_ICON_CLASS = 'w-[18px] h-[18px] shrink-0';
const MINI_ICON_CLASS = 'w-[9px] h-[9px] shrink-0';

function SvgIconFrame({ viewBox = '0 0 24 24', className = ITEM_ICON_CLASS, children }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            fill="none"
            className={className}
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

function BrandIcon({ icon, className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame className={className}>
            <path d={icon.path} fill="currentColor" />
        </SvgIconFrame>
    );
}

function MiniBrandIcon({ icon }) {
    return <BrandIcon icon={icon} className={MINI_ICON_CLASS} />;
}

function DualBrandIcon({ left, right, className = ITEM_ICON_CLASS }) {
    return (
        <div className={`${className} grid grid-cols-2 gap-[2px] items-center justify-items-center`} aria-hidden="true">
            {left}
            {right}
        </div>
    );
}

function TripleBrandCluster({ topLeft, topRight, bottom, className = ITEM_ICON_CLASS }) {
    return (
        <div className={`${className} grid grid-cols-2 grid-rows-2 gap-[2px] items-center justify-items-center`} aria-hidden="true">
            <div className="flex items-center justify-center">{topLeft}</div>
            <div className="flex items-center justify-center">{topRight}</div>
            <div className="col-span-2 flex items-center justify-center">{bottom}</div>
        </div>
    );
}

function GroqIcon({ className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame viewBox="0 0 498.82 299.17" className={className}>
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
    );
}

function MiniGroqIcon() {
    return <GroqIcon className={MINI_ICON_CLASS} />;
}

function TesseractIcon({ className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame viewBox="0 0 48 48" className={className}>
            <path
                d="M7.66,22.0588H40.34a3.16,3.16,0,0,1,3.16,3.16v10.2a3.16,3.16,0,0,1-3.16,3.16H7.66a3.16,3.16,0,0,1-3.16-3.16v-10.2A3.16,3.16,0,0,1,7.66,22.0588Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M40.32,22.0631,5.37,9.4212"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <rect
                x="17.2363"
                y="28.1436"
                width="22.338"
                height="4.3504"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <rect
                x="8.3367"
                y="28.1436"
                width="4.3435"
                height="4.3504"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </SvgIconFrame>
    );
}

function MiniTesseractIcon() {
    return <TesseractIcon className={MINI_ICON_CLASS} />;
}

function MultithreadingIcon({ className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame className={className}>
            <circle cx="6" cy="7" r="1.8" fill="currentColor" />
            <circle cx="18" cy="7" r="1.8" fill="currentColor" />
            <circle cx="6" cy="17" r="1.8" fill="currentColor" />
            <circle cx="18" cy="17" r="1.8" fill="currentColor" />
            <path
                d="M7.8 7h4.6c2.1 0 3.8 1.7 3.8 3.8V13M7.8 17h4.8c2 0 3.7-1.5 3.8-3.5V11M16 13h.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </SvgIconFrame>
    );
}

function DataProcessingIcon({ className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame className={className}>
            <rect x="4.5" y="6" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="12.5" y="10" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="4.5" y="14" width="7" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
            <path
                d="M11.5 8h2.6M15.5 10V8M12.5 16H10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </SvgIconFrame>
    );
}

function InferenceIcon({ className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame className={className}>
            <circle cx="7" cy="7" r="1.7" fill="currentColor" />
            <circle cx="7" cy="17" r="1.7" fill="currentColor" />
            <circle cx="13" cy="12" r="1.7" fill="currentColor" />
            <path
                d="M8.5 7.8 11.5 10.7M8.5 16.2l3-2.9M14.8 12H19m-2-2 2 2-2 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </SvgIconFrame>
    );
}

function ShaderIcon({ className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame className={className}>
            <path
                d="M12 4.5 5.5 8.2v7.6l6.5 3.7 6.5-3.7V8.2L12 4.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="m9.1 9.4 2.9 2.6 2.9-2.6M12 12v7.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="m18.2 4.3.9 1.9 1.9.9-1.9.9-.9 1.9-.9-1.9-1.9-.9 1.9-.9.9-1.9Z"
                fill="currentColor"
            />
        </SvgIconFrame>
    );
}

function DefaultTechIcon({ className = ITEM_ICON_CLASS }) {
    return (
        <SvgIconFrame className={className}>
            <path d="M8.5 7 4 12l4.5 5M15.5 7 20 12l-4.5 5M13.2 4.8 10.8 19.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </SvgIconFrame>
    );
}

const TECH_ITEM_ICON_FACTORIES = {
    'Python': () => <BrandIcon icon={siPython} />,
    'C#': () => <BrandIcon icon={siSharp} />,
    'SQL / NoSQL': () => (
        <DualBrandIcon
            left={<MiniBrandIcon icon={siPostgresql} />}
            right={<MiniBrandIcon icon={siMongodb} />}
        />
    ),
    'Node.js': () => <BrandIcon icon={siNodedotjs} />,
    'Multithreading': () => <MultithreadingIcon />,
    'API Design': () => <BrandIcon icon={siOpenapiinitiative} />,
    'Groq (Llama 3)': () => (
        <DualBrandIcon
            left={<MiniGroqIcon />}
            right={<MiniBrandIcon icon={siMeta} />}
        />
    ),
    'Tesseract OCR': () => <TesseractIcon />,
    'Selenium': () => <BrandIcon icon={siSelenium} />,
    'Data Processing': () => <DataProcessingIcon />,
    'Inference': () => <InferenceIcon />,
    'React': () => <BrandIcon icon={siReact} />,
    'Unity 3D': () => <BrandIcon icon={siUnity} />,
    'Tailwind CSS': () => <BrandIcon icon={siTailwindcss} />,
    'Motion Design': () => <BrandIcon icon={siFramer} />,
    'HLSL Shaders': () => <ShaderIcon />,
    'Firebase': () => <BrandIcon icon={siFirebase} />,
    'Supabase': () => <BrandIcon icon={siSupabase} />,
    'Git / GitHub': () => (
        <DualBrandIcon
            left={<MiniBrandIcon icon={siGit} />}
            right={<MiniBrandIcon icon={siGithub} />}
        />
    ),
    'Vercel': () => <BrandIcon icon={siVercel} />,
    'Vite': () => <BrandIcon icon={siVite} />,
    'Postman': () => <BrandIcon icon={siPostman} />,
};

const TECH_CATEGORY_ICON_FACTORIES = {
    'Core Development': () => (
        <TripleBrandCluster
            topLeft={<MiniBrandIcon icon={siPython} />}
            topRight={<MiniBrandIcon icon={siSharp} />}
            bottom={<MiniBrandIcon icon={siNodedotjs} />}
        />
    ),
    'AI & Vision Workflows': () => (
        <TripleBrandCluster
            topLeft={<MiniGroqIcon />}
            topRight={<MiniTesseractIcon />}
            bottom={<MiniBrandIcon icon={siSelenium} />}
        />
    ),
    'Frontend & Interactive Systems': () => (
        <TripleBrandCluster
            topLeft={<MiniBrandIcon icon={siReact} />}
            topRight={<MiniBrandIcon icon={siUnity} />}
            bottom={<MiniBrandIcon icon={siTailwindcss} />}
        />
    ),
    'Infra & Delivery': () => (
        <TripleBrandCluster
            topLeft={<MiniBrandIcon icon={siSupabase} />}
            topRight={<MiniBrandIcon icon={siVercel} />}
            bottom={<MiniBrandIcon icon={siGithub} />}
        />
    ),
};

export function renderTechItemIcon(name) {
    const renderIcon = TECH_ITEM_ICON_FACTORIES[name] || (() => <DefaultTechIcon />);
    return renderIcon();
}

export function renderTechCategoryIcon(title) {
    const renderIcon = TECH_CATEGORY_ICON_FACTORIES[title] || (() => <DefaultTechIcon />);
    return renderIcon();
}
