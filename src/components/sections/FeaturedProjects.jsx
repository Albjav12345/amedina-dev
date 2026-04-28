import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import { Code2, ArrowUpRight, Terminal, X, Github, Cpu, ExternalLink, Zap, Box, Brain, Layers, Globe } from 'lucide-react';
import WorkflowDiagram from '../common/WorkflowDiagram';
import { viewportConfig } from '../../utils/animations';
import { useHardwareQuality } from '../../hooks/useHardwareQuality';
import SmartThumbnail from './SmartThumbnail';
import { subscribeScrollRuntime } from '../../utils/scrollRuntime';

import portfolioData from '../../data/portfolio';

const { projects } = portfolioData;

const cardVariants = {
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        pointerEvents: "auto",
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    below: {
        opacity: 0,
        y: 80,
        scale: 0.95,
        pointerEvents: "none",
        transition: { duration: 0.4 }
    },
    above: {
        opacity: 0,
        y: -150,
        scale: 0.95,
        pointerEvents: "none",
        transition: { duration: 0.4 }
    }
};

function areIdListsEqual(left, right) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((value, index) => value === right[index]);
}

const FeaturedProjects = () => {
    const [selectedId, setSelectedId] = useState(null);
    const [elevatedCardId, setElevatedCardId] = useState(null);
    const [closingCardId, setClosingCardId] = useState(null);
    const [isContentReady, setContentReady] = useState(false);
    const [isContentClosing, setIsContentClosing] = useState(false);
    const [isMobileSheetBodyVisible, setIsMobileSheetBodyVisible] = useState(false);
    const [isMobileSheetClosingFromDrag, setIsMobileSheetClosingFromDrag] = useState(false);
    const [isMobileSheetDragging, setIsMobileSheetDragging] = useState(false);
    const [isSectionNearViewport, setIsSectionNearViewport] = useState(false);
    const [isScrollIdle, setIsScrollIdle] = useState(false);
    const [cardStatus, setCardStatus] = useState({});
    const [allowedVideoIds, setAllowedVideoIds] = useState([]);
    const quality = useHardwareQuality();
    const useCompactProjectModal = quality.useCompactProjectModal || quality.useVerticalSheetLayout;
    const useMobileProjectSheet = quality.useVerticalSheetLayout;
    const useWideProjectLayout = quality.useWideProjectModalLayout;
    const shouldUseDesktopProjectTransition = !useMobileProjectSheet && !useCompactProjectModal;

    const cardRefs = useRef({});
    const sectionRef = useRef(null);
    const allowedVideoIdsRef = useRef([]);
    const idleTimeoutRef = useRef(null);
    const lastScrollYRef = useRef(null);
    const closeFrameRef = useRef(null);
    const isClosingRef = useRef(false);
    const mobileSheetAnimationRef = useRef(null);
    const mobileSheetDragCleanupRef = useRef(null);
    const mobileSheetDragFrameRef = useRef(0);
    const pendingMobileSheetYRef = useRef(0);
    const mobileSheetY = useMotionValue(0);
    const mobileSheetOverlayOpacity = useTransform(mobileSheetY, [0, 260], [1, 0]);
    const isProjectTransitionActive = selectedId !== null || closingCardId !== null;

    const stopMobileSheetAnimation = () => {
        mobileSheetAnimationRef.current?.stop?.();
        mobileSheetAnimationRef.current = null;
    };

    const runMobileSheetAnimation = (target, options) => {
        stopMobileSheetAnimation();
        const controls = animate(mobileSheetY, target, options);
        mobileSheetAnimationRef.current = controls;
        return controls;
    };

    const clearMobileSheetDrag = () => {
        mobileSheetDragCleanupRef.current?.();
        mobileSheetDragCleanupRef.current = null;

        if (mobileSheetDragFrameRef.current) {
            window.cancelAnimationFrame(mobileSheetDragFrameRef.current);
            mobileSheetDragFrameRef.current = 0;
        }
    };

    useEffect(() => {
        const node = sectionRef.current;
        if (!node) {
            return undefined;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setIsSectionNearViewport(true);
            return undefined;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setIsSectionNearViewport(Boolean(entry?.isIntersecting));
        }, {
            root: null,
            rootMargin: `${quality.previewRootMarginPx}px 0px ${quality.previewRootMarginPx}px 0px`,
            threshold: 0.01,
        });

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, [quality.previewRootMarginPx]);

    useEffect(() => {
        if (selectedId) {
            setIsScrollIdle(false);
            return undefined;
        }

        return subscribeScrollRuntime((runtimeSnapshot) => {
            const didMove = lastScrollYRef.current === null || Math.abs(runtimeSnapshot.scrollY - lastScrollYRef.current) > 0.5;
            lastScrollYRef.current = runtimeSnapshot.scrollY;

            if (didMove) {
                setIsScrollIdle(false);
            }

            if (idleTimeoutRef.current !== null) {
                window.clearTimeout(idleTimeoutRef.current);
            }

            idleTimeoutRef.current = window.setTimeout(() => {
                setIsScrollIdle(true);
            }, quality.previewIdleDelayMs);
        });
    }, [quality.previewIdleDelayMs, selectedId]);

    useEffect(() => {
        return () => {
            if (closeFrameRef.current !== null) {
                window.cancelAnimationFrame(closeFrameRef.current);
            }

            if (idleTimeoutRef.current !== null) {
                window.clearTimeout(idleTimeoutRef.current);
            }

            stopMobileSheetAnimation();
            clearMobileSheetDrag();
        };
    }, []);

    useEffect(() => {
        if (isMobileSheetClosingFromDrag) {
            return undefined;
        }

        if (!selectedId || !useMobileProjectSheet) {
            setIsMobileSheetClosingFromDrag(false);
            setIsMobileSheetDragging(false);
            setIsMobileSheetBodyVisible(false);
            mobileSheetY.set(0);
            return undefined;
        }

        setIsMobileSheetClosingFromDrag(false);
        setIsMobileSheetDragging(false);

        const entryOffset = Math.min(window.innerHeight * 0.09, 84);
        mobileSheetY.set(entryOffset);
        const controls = runMobileSheetAnimation(0, {
            duration: 0.22,
            ease: [0.22, 1, 0.36, 1],
        });

        return () => controls.stop();
    }, [isMobileSheetClosingFromDrag, mobileSheetY, selectedId, useMobileProjectSheet]);

    useEffect(() => {
        if (isMobileSheetClosingFromDrag) {
            return undefined;
        }

        if (!selectedId || !useMobileProjectSheet) {
            setIsMobileSheetBodyVisible(false);
            return undefined;
        }

        setIsMobileSheetBodyVisible(false);

        const revealTimeout = window.setTimeout(() => {
            setIsMobileSheetBodyVisible(true);
        }, 90);

        return () => window.clearTimeout(revealTimeout);
    }, [isMobileSheetClosingFromDrag, selectedId, useMobileProjectSheet]);

    useEffect(() => {
        if (selectedId || !isSectionNearViewport || !isScrollIdle) {
            if (allowedVideoIdsRef.current.length) {
                allowedVideoIdsRef.current = [];
                setAllowedVideoIds([]);
            }
            return undefined;
        }

        const updateOrchestration = (runtimeSnapshot) => {
            const maxVideos = quality.maxPreviewVideos;

            if (!maxVideos) {
                if (allowedVideoIdsRef.current.length) {
                    allowedVideoIdsRef.current = [];
                    setAllowedVideoIds([]);
                }
                return;
            }

            const targetLine = runtimeSnapshot.height * 0.62;
            const visibleIds = Object.entries(cardStatus)
                .filter(([, status]) => status === 'visible')
                .map(([id]) => Number(id));

            if (!visibleIds.length) {
                if (allowedVideoIdsRef.current.length) {
                    allowedVideoIdsRef.current = [];
                    setAllowedVideoIds([]);
                }
                return;
            }

            const measured = visibleIds.map((id) => {
                const element = cardRefs.current[id];
                if (!element) {
                    return null;
                }

                const rect = element.getBoundingClientRect();
                if (rect.bottom < -96 || rect.top > runtimeSnapshot.height + 96) {
                    return null;
                }

                const centerY = rect.top + rect.height / 2;
                return { id, distance: Math.abs(centerY - targetLine) };
            }).filter(Boolean);

            const winningIds = measured
                .sort((a, b) => a.distance - b.distance)
                .slice(0, maxVideos)
                .map((entry) => entry.id);

            if (!areIdListsEqual(allowedVideoIdsRef.current, winningIds)) {
                allowedVideoIdsRef.current = winningIds;
                setAllowedVideoIds(winningIds);
            }
        };

        return subscribeScrollRuntime(updateOrchestration);
    }, [cardStatus, isScrollIdle, isSectionNearViewport, quality.maxPreviewVideos, selectedId]);

    const handleViewportAction = (id, inView, entry) => {
        if (inView) {
            setCardStatus((prev) => ({ ...prev, [id]: 'visible' }));
        } else if (entry) {
            const isAbove = entry.boundingClientRect.top < 0;
            setCardStatus((prev) => ({ ...prev, [id]: isAbove ? 'above' : 'below' }));
        }
    };

    const { projects: projectsHeader } = portfolioData.ui.sections;

    const iconMap = {
        Zap: <Zap className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Box: <Box className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Cpu: <Cpu className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Brain: <Brain className="w-6 h-6 md:w-10 md:h-10 text-electric-cyan" />,
        Layers: <Layers className="w-6 h-6 md:w-10 md:h-10 text-electric-green" />,
        Globe: <Globe className="w-6 h-6 md:w-10 md:h-10 text-electric-cyan" />
    };

    const modalViewportClass = useCompactProjectModal
        ? 'fixed inset-0 z-[70] flex items-start justify-center p-4 pt-4 overflow-y-auto custom-scrollbar line-clamp-none'
        : 'fixed inset-0 z-[70] flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto custom-scrollbar pt-10 md:pt-8 line-clamp-none';
    const modalCloseClass = useCompactProjectModal
        ? 'fixed top-6 right-6 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-electric-green hover:text-dark-void z-[110] transition-all cursor-pointer'
        : 'fixed md:absolute top-6 right-6 p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-electric-green hover:text-dark-void z-[110] transition-all cursor-pointer';
    const modalShellClass = useCompactProjectModal
        ? `relative w-full max-w-[860px] mx-auto border border-white/10 rounded-2xl overflow-hidden flex flex-col h-auto min-h-[50vh] gpu-accelerated ${quality.allowBlur ? 'shadow-2xl' : 'shadow-[0_12px_40px_rgba(0,0,0,0.45)]'} ${quality.glassClass}`
        : `relative w-full ${useWideProjectLayout ? 'max-w-6xl' : 'max-w-[860px]'} mx-auto border border-white/10 md:rounded-2xl overflow-hidden flex flex-col ${useWideProjectLayout ? 'lg:grid lg:grid-cols-2' : ''} h-auto min-h-[50vh] gpu-accelerated ${useCompactProjectModal ? '' : 'layout-projection-surface'} my-8 md:my-0 ${quality.allowBlur ? 'shadow-2xl' : 'shadow-[0_12px_40px_rgba(0,0,0,0.45)]'} ${quality.glassClass}`;
    const projectInfoPanelClass = useCompactProjectModal
        ? 'w-full p-6 flex flex-col order-2 border-b border-white/5'
        : `${useWideProjectLayout ? 'w-full lg:col-start-1 lg:row-start-1 lg:row-span-2' : 'w-full'} p-6 md:p-12 ${useWideProjectLayout ? 'md:overflow-y-auto custom-scrollbar' : ''} flex flex-col ${useWideProjectLayout ? 'order-2 lg:order-none border-b lg:border-b-0' : 'order-2 border-b'} border-white/5`;
    const projectMediaPanelClass = useCompactProjectModal
        ? 'w-full bg-black/40 border-b border-white/5 flex flex-col p-6 gap-6 order-1'
        : `${useWideProjectLayout ? 'w-full lg:col-start-2 lg:row-start-1' : 'w-full'} bg-black/40 ${useWideProjectLayout ? 'border-b lg:border-l' : 'border-b'} border-white/5 flex flex-col p-6 md:p-12 gap-6 ${useWideProjectLayout ? 'order-1 lg:order-none' : 'order-1'}`;
    const projectFlowPanelClass = useCompactProjectModal
        ? 'w-full bg-black/60 border-t border-white/5 flex flex-col p-6 gap-6 order-3'
        : `${useWideProjectLayout ? 'w-full lg:col-start-2 lg:row-start-2' : 'w-full'} bg-black/60 ${useWideProjectLayout ? 'lg:bg-black/40 border-t lg:border-t-0 lg:border-l' : 'border-t'} border-white/5 flex flex-col p-6 md:p-12 gap-6 ${useWideProjectLayout ? 'order-3 lg:order-none' : 'order-3'}`;
    const projectTitleClass = useCompactProjectModal
        ? 'text-3xl font-bold text-white tracking-tighter leading-tight'
        : 'text-3xl md:text-5xl font-bold text-white tracking-tighter leading-tight';
    const projectProblemGridClass = useCompactProjectModal
        ? 'grid grid-cols-1 gap-6 py-2'
        : 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 py-2';
    const compactModalMotion = useCompactProjectModal
        ? {
            initial: { opacity: 0, y: 20, scale: 0.992 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 14, scale: 0.992 },
        }
        : null;
    const compactContentMotion = useCompactProjectModal
        ? {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            transition: {
                duration: 0.24,
                delay: 0.04,
                ease: [0.16, 1, 0.3, 1],
            },
        }
        : null;
    const desktopShellAnimate = shouldUseDesktopProjectTransition
        ? {
            opacity: isContentClosing ? 0.2 : 1,
        }
        : undefined;
    const desktopShellTransition = shouldUseDesktopProjectTransition
        ? {
            layout: quality.modalTransition,
            opacity: isContentClosing
                ? {
                    duration: 0.26,
                    delay: 0.1,
                    ease: [0.4, 0, 1, 1],
                }
                : {
                    duration: 0.18,
                    ease: [0.16, 1, 0.3, 1],
                },
        }
        : quality.modalTransition;

    useLayoutEffect(() => {
        if (isProjectTransitionActive) {
            const scrollbarCompensation = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
            const navbarLayer = isContentClosing ? '120' : '60';

            document.documentElement.style.setProperty('--viewport-scrollbar-compensation', `${scrollbarCompensation}px`);
            document.documentElement.style.setProperty('--project-navbar-layer', navbarLayer);
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarCompensation}px`;
            document.body.style.overscrollBehaviorY = 'none';
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.overscrollBehaviorY = 'none';
            window.lenis?.stop?.();
            setContentReady(false);
        } else {
            document.documentElement.style.setProperty('--viewport-scrollbar-compensation', '0px');
            document.documentElement.style.setProperty('--project-navbar-layer', '1000');
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '';
            document.body.style.overscrollBehaviorY = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.overscrollBehaviorY = '';
            window.lenis?.start?.();
            setContentReady(false);
        }

        return () => {
            document.documentElement.style.setProperty('--viewport-scrollbar-compensation', '0px');
            document.documentElement.style.setProperty('--project-navbar-layer', '1000');
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '';
            document.body.style.overscrollBehaviorY = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.overscrollBehaviorY = '';
            window.lenis?.start?.();
        };
    }, [isContentClosing, isProjectTransitionActive]);

    useEffect(() => {
        const handleExternalClose = () => {
            void handleProjectClose();
        };

        window.addEventListener('close-project-modal', handleExternalClose);

        return () => {
            window.removeEventListener('close-project-modal', handleExternalClose);
        };
    }, [selectedId, useCompactProjectModal]);

    useEffect(() => {
        if (useCompactProjectModal && elevatedCardId !== null) {
            setElevatedCardId(null);
        }
    }, [elevatedCardId, useCompactProjectModal]);

    const activeProject = projects.find((project) => project.id === selectedId);

    const handleProjectOpen = (projectId) => {
        if (closeFrameRef.current !== null) {
            window.cancelAnimationFrame(closeFrameRef.current);
            closeFrameRef.current = null;
        }

        if (idleTimeoutRef.current !== null) {
            window.clearTimeout(idleTimeoutRef.current);
        }

        isClosingRef.current = false;
        setIsContentClosing(false);
        setIsMobileSheetClosingFromDrag(false);
        setIsMobileSheetDragging(false);
        setIsMobileSheetBodyVisible(false);
        stopMobileSheetAnimation();
        clearMobileSheetDrag();
        allowedVideoIdsRef.current = [];
        setAllowedVideoIds([]);
        setIsScrollIdle(false);
        setClosingCardId(null);
        setElevatedCardId(useCompactProjectModal ? null : projectId);
        setSelectedId(projectId);
    };

    const handleProjectClose = async () => {
        if (!selectedId) {
            return;
        }

        if (closeFrameRef.current !== null) {
            window.cancelAnimationFrame(closeFrameRef.current);
            closeFrameRef.current = null;
        }

        if (useMobileProjectSheet) {
            clearMobileSheetDrag();
            setIsMobileSheetDragging(false);
            setIsMobileSheetClosingFromDrag(true);
            await runMobileSheetAnimation(window.innerHeight, {
                duration: 0.16,
                ease: [0.22, 1, 0.36, 1],
            });
            isClosingRef.current = false;
            setIsContentClosing(false);
            setSelectedId(null);
            setClosingCardId(null);
            setElevatedCardId(null);
            return;
        }

        if (useCompactProjectModal) {
            isClosingRef.current = false;
            setIsContentClosing(false);
            setSelectedId(null);
            setClosingCardId(null);
            setElevatedCardId(null);
            return;
        }

        isClosingRef.current = true;
        setIsContentClosing(true);
        setClosingCardId(selectedId);
        closeFrameRef.current = window.requestAnimationFrame(() => {
            closeFrameRef.current = null;
            setSelectedId(null);
        });
    };

    const handleMobileSheetDragRelease = async (velocity = 0, offset = mobileSheetY.get()) => {
        const shouldClose = offset > 96 || velocity > 700;

        if (shouldClose) {
            await handleProjectClose();
            return;
        }

        setIsMobileSheetClosingFromDrag(false);
        setIsMobileSheetDragging(false);
        runMobileSheetAnimation(0, {
            type: 'spring',
            stiffness: 420,
            damping: 36,
        });
    };

    const startMobileSheetDrag = (event) => {
        if (!useMobileProjectSheet) return;
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        stopMobileSheetAnimation();
        setIsMobileSheetClosingFromDrag(false);
        setIsMobileSheetDragging(true);

        const dragState = {
            pointerId: event.pointerId,
            startY: event.clientY,
            lastY: event.clientY,
            lastTime: performance.now(),
            velocity: 0,
        };

        clearMobileSheetDrag();

        const handlePointerMove = (moveEvent) => {
            if (moveEvent.pointerId !== dragState.pointerId) return;

            const offset = Math.max(0, moveEvent.clientY - dragState.startY);
            const now = performance.now();
            const elapsed = Math.max(now - dragState.lastTime, 1);

            dragState.velocity = ((moveEvent.clientY - dragState.lastY) / elapsed) * 1000;
            dragState.lastY = moveEvent.clientY;
            dragState.lastTime = now;

            pendingMobileSheetYRef.current = offset;
            if (!mobileSheetDragFrameRef.current) {
                mobileSheetDragFrameRef.current = window.requestAnimationFrame(() => {
                    mobileSheetY.set(pendingMobileSheetYRef.current);
                    mobileSheetDragFrameRef.current = 0;
                });
            }

            moveEvent.preventDefault();
        };

        const handlePointerEnd = async (endEvent) => {
            if (endEvent.pointerId !== dragState.pointerId) return;

            const offset = Math.max(0, endEvent.clientY - dragState.startY);
            clearMobileSheetDrag();
            await handleMobileSheetDragRelease(dragState.velocity, offset);
        };

        mobileSheetDragCleanupRef.current = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerEnd);
            window.removeEventListener('pointercancel', handlePointerEnd);
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: false });
        window.addEventListener('pointerup', handlePointerEnd);
        window.addEventListener('pointercancel', handlePointerEnd);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    };

    const handleMobileSheetHeaderPointerDown = (event) => {
        if (!useMobileProjectSheet) return;

        const target = event.target;
        if (target instanceof Element && target.closest('button, a, input, textarea, select, [data-no-drag="true"]')) {
            return;
        }

        startMobileSheetDrag(event);
    };

    const projectDetailPanels = activeProject ? (
        <>
            <div className={projectInfoPanelClass}>
                <div className="space-y-8 flex-grow">
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 md:space-y-4 md:flex-grow">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[10px] text-electric-green bg-electric-green/10 px-2 py-0.5 rounded border border-electric-green/20 uppercase tracking-widest">
                                        Active_Module
                                    </span>
                                    <div className="h-px w-8 bg-white/10 hidden md:block"></div>
                                </div>

                                <h2 className={projectTitleClass}>
                                    {activeProject.title}
                                </h2>
                            </div>

                            {activeProject.icon && (
                                <div className={`shrink-0 flex items-center justify-center rounded-2xl md:mt-4 lg:mt-6 transition-all duration-300 ${
                                    iconMap[activeProject.icon] || activeProject.iconFit !== 'auto'
                                        ? "w-12 h-12 md:w-24 md:h-24 bg-white/5 border border-white/10 shadow-glow-green/20 overflow-hidden"
                                        : "h-12 md:h-24 w-auto overflow-visible"
                                }`}>
                                    {iconMap[activeProject.icon] ? (
                                        <div className="flex items-center justify-center w-full h-full p-3 md:p-5">
                                            {iconMap[activeProject.icon]}
                                        </div>
                                    ) : (
                                        <img
                                            src={activeProject.icon}
                                            alt="Project Icon"
                                            style={activeProject.iconScale ? { transform: `scale(${activeProject.iconScale})` } : {}}
                                            className={activeProject.iconFit === 'auto'
                                                ? "h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]"
                                                : "w-full h-full object-cover"}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="text-base md:text-lg text-gray-400 font-medium leading-relaxed">
                            {activeProject.subtitle}
                        </p>
                    </div>

                    <div className={projectProblemGridClass}>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                                <Cpu className="w-3 h-3 text-electric-cyan" />
                                Context_Problem
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {activeProject.problem}
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-electric-green font-mono text-[10px] uppercase tracking-widest">
                                <Terminal className="w-3 h-3" />
                                Engineered_Solution
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed border-l border-electric-green/20 pl-4 py-1">
                                {activeProject.solution}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block pb-2 border-b border-white/5">Tech_Arsenal</span>
                        <div className="flex flex-wrap gap-2">
                            {activeProject.stack.map((tech) => (
                                <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md font-mono text-[10px] text-gray-300">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-10 mt-auto flex flex-col sm:flex-row gap-4">
                    <a
                        href={activeProject.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow btn-system inline-flex items-center justify-center gap-3 px-8 py-4 group"
                    >
                        <span className="font-mono text-sm tracking-widest uppercase">Access_Repo</span>
                        <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                </div>
            </div>

            <div className={projectMediaPanelClass}>
                <div className="space-y-4 flex-grow">
                    <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest inline-flex items-center gap-2">
                        Live_Stream_Demo
                        <ExternalLink className="w-3 h-3 opacity-50" />
                    </span>
                    <div className={`relative aspect-video rounded-xl overflow-hidden glass-card border-white/10 group/media bg-black shadow-2xl ${useWideProjectLayout ? '' : 'max-h-[min(46vh,28rem)]'}`}>
                        {activeProject.demoType === 'video' ? (
                            <video
                                src={activeProject.media.modalVideo}
                                poster={activeProject.media.poster}
                                controls
                                preload="metadata"
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img
                                src={activeProject.media.poster || activeProject.thumbnail}
                                alt="Demo Preview"
                                className="w-full h-full object-cover"
                            />
                        )}

                        <div className="absolute top-0 left-0 w-full h-[2px] bg-electric-green/20 shadow-[0_0_15px_rgba(0,255,153,0.3)] animate-scan pointer-events-none z-10"></div>

                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none opacity-0 group-hover/media:opacity-100 transition-opacity">
                            <div className="w-2 h-2 rounded-full bg-electric-green animate-pulse"></div>
                            <span className="font-mono text-[8px] text-electric-green uppercase tracking-[0.2em] bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                                HD_SOURCE_ACTIVE
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={projectFlowPanelClass}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">System_Arch_Flow</span>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-electric-green animate-pulse"></div>
                            <div className="w-1 h-1 rounded-full bg-electric-green delay-100 animate-pulse"></div>
                            <div className="w-1 h-1 rounded-full bg-electric-green delay-200 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="p-4 md:p-6 rounded-xl bg-white/5 border border-white/10">
                        <WorkflowDiagram steps={activeProject.arch} />
                    </div>
                </div>
            </div>
        </>
    ) : null;

    const handleProjectModalExitComplete = () => {
        setContentReady(false);
        setIsContentClosing(false);
        setIsMobileSheetBodyVisible(false);
        setIsMobileSheetClosingFromDrag(false);
        setIsMobileSheetDragging(false);
        mobileSheetY.set(0);
        isClosingRef.current = false;
        setClosingCardId(null);
        setElevatedCardId(null);
        stopMobileSheetAnimation();
        clearMobileSheetDrag();
    };

    const mobileProjectSheet = selectedId && activeProject && useMobileProjectSheet ? (
        <React.Fragment key={`project-sheet-${selectedId}`}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { void handleProjectClose(); }}
                className="fixed inset-0 z-[1200] bg-black/68"
                style={{ opacity: mobileSheetOverlayOpacity, willChange: 'opacity' }}
            />

            <motion.aside
                initial={false}
                animate={{ y: 0 }}
                exit={isMobileSheetClosingFromDrag ? { opacity: 1 } : { y: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed inset-x-2 bottom-2 top-4 z-[1210] mx-auto max-w-[860px] transform-gpu rounded-[24px] border border-white/10 ${isMobileSheetDragging ? 'bg-[#0b0d11]/98 shadow-[0_12px_28px_rgba(0,0,0,0.28)]' : 'bg-[#0b0d11]/98 shadow-[0_20px_70px_rgba(0,0,0,0.42)]'}`}
                style={{ y: mobileSheetY, touchAction: 'auto', willChange: 'transform', backfaceVisibility: 'hidden' }}
                data-lenis-prevent
                data-lenis-prevent-touch
            >
                <div className="flex h-full flex-col overflow-hidden rounded-[24px]">
                    <div
                        className="touch-none border-b border-white/10 px-4 py-4"
                        onPointerDown={handleMobileSheetHeaderPointerDown}
                    >
                        <div className="mb-3 flex justify-center">
                            <button
                                type="button"
                                onPointerDown={startMobileSheetDrag}
                                className="touch-none cursor-grab active:cursor-grabbing"
                                aria-label="Drag down to close project panel"
                            >
                                <div className="h-1.5 w-16 rounded-full bg-white/10" />
                            </button>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-2 rounded-full border border-electric-green/20 bg-electric-green/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-electric-green">
                                    <Code2 className="h-3 w-3" />
                                    Active Project
                                </div>
                                <h2 className="mt-4 text-[2rem] font-bold leading-[0.95] tracking-tight text-white">
                                    {activeProject.title}
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                                    {activeProject.subtitle}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { void handleProjectClose(); }}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-300 transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                                aria-label="Close project panel"
                                data-no-drag="true"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <motion.div
                        initial={false}
                        animate={isMobileSheetBodyVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="panel-scrollbar flex-1 overflow-y-auto"
                        data-lenis-prevent
                        data-lenis-prevent-touch
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            overscrollBehaviorY: 'contain',
                            touchAction: 'pan-y',
                        }}
                    >
                        <div className="flex flex-col">
                            {projectDetailPanels}
                        </div>
                    </motion.div>
                </div>
            </motion.aside>
        </React.Fragment>
    ) : null;

    const mobileProjectSheetPortal = typeof document !== 'undefined' && mobileProjectSheet
        ? createPortal(mobileProjectSheet, document.body)
        : null;

    return (
        <section
            id="projects"
            ref={sectionRef}
            className="py-20 md:py-32 relative overflow-hidden render-optimize"
        >
            <div
                className="absolute top-[20%] right-0 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] pointer-events-none opacity-40 translate-x-1/2"
                style={{ background: "radial-gradient(circle, rgba(0, 255, 153, 0.13) 0%, transparent 70%)" }}
            />

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportConfig}
                    className="flex flex-col mb-16"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <span className="font-mono text-xs text-electric-green bg-electric-green/10 border border-electric-green/20 px-2 py-1 rounded">{projectsHeader.id}</span>
                        <div className="h-px flex-grow bg-gradient-to-r from-electric-green/30 to-transparent"></div>
                    </div>
                    <h2 className="text-5xl font-bold font-mono tracking-tighter uppercase text-white">
                        {projectsHeader.line1} <br />
                        <span className="text-electric-green">{projectsHeader.line2}</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                    {projects.map((project) => {
                        const isSelected = selectedId === project.id;
                        const isAllowedToPlay = allowedVideoIds.includes(project.id);
                        const currentStatus = isSelected ? "visible" : (cardStatus[project.id] || "below");
                        const isElevatedCard = elevatedCardId === project.id;
                        const shouldHideGalleryCard = !useMobileProjectSheet && isSelected;

                        return (
                            <motion.div
                                ref={(element) => { cardRefs.current[project.id] = element; }}
                                key={project.id}
                                layoutId={useCompactProjectModal ? undefined : `project-${project.id}`}
                                initial="below"
                                animate={currentStatus}
                                viewport={{ once: false, amount: 0.1, margin: "15% 0px 15% 0px" }}
                                onViewportEnter={(entry) => handleViewportAction(project.id, true, entry)}
                                onViewportLeave={(entry) => handleViewportAction(project.id, false, entry)}
                                variants={cardVariants}
                                onClick={() => handleProjectOpen(project.id)}
                                className={`gpu-accelerated layout-projection-surface cursor-pointer group relative flex flex-col h-[220px] md:h-[450px] overflow-hidden rounded-xl border ${shouldHideGalleryCard ? 'border-transparent bg-transparent' : 'border-white/5 bg-dark-high/90'}`}
                                style={isElevatedCard ? { zIndex: 80 } : undefined}
                            >
                                <div className={`relative flex h-full flex-col ${shouldHideGalleryCard ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                    <div className="relative w-full h-[60%] md:h-[60%] overflow-hidden bg-black/40 border-b border-white/10 group-hover:border-electric-green/20 transition-colors">
                                        <SmartThumbnail
                                            project={project}
                                            isAllowedToPlay={isSectionNearViewport && isScrollIdle && !selectedId && isAllowedToPlay}
                                            stagger={allowedVideoIds.indexOf(project.id)}
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-dark-high via-transparent to-transparent pointer-events-none group-hover:opacity-40 transition-opacity duration-700"></div>
                                        {!quality.simplePhysics && isSectionNearViewport && !selectedId && (
                                            <div className="absolute top-0 left-0 w-full h-[1px] bg-electric-green/10 shadow-[0_0_10px_rgba(0,255,153,0.3)] animate-scan pointer-events-none z-20"></div>
                                        )}

                                        <div className="absolute top-4 left-4 flex gap-1 z-20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/30"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/30"></div>
                                        </div>
                                    </div>

                                    <div className="p-3 md:p-8 flex flex-col justify-between flex-grow relative z-10">
                                        <div className="relative">
                                            <div className="flex justify-between items-start mb-1 md:mb-4">
                                                <div className="w-6 h-6 md:w-10 md:h-10 rounded-md md:rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-electric-green/50 transition-colors">
                                                    <Code2 className="w-3 h-3 md:w-5 md:h-5 text-gray-400 group-hover:text-electric-green transition-colors" />
                                                </div>
                                                <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 text-gray-600 group-hover:text-electric-green transition-colors" />
                                            </div>
                                            <h3 className="text-sm md:text-xl font-bold text-white mb-0.5 md:mb-2 leading-tight group-hover:text-electric-green transition-colors line-clamp-1">{project.title}</h3>
                                            <p className="text-gray-500 font-mono text-[7px] md:text-[9px] uppercase tracking-widest line-clamp-1">{project.subtitle}</p>
                                        </div>

                                        <div className="hidden md:flex mt-6 flex-wrap gap-2">
                                            {project.stack.slice(0, 3).map((tech) => (
                                                <span key={tech} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-mono text-gray-500">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-electric-green/5 blur-3xl rounded-full group-hover:bg-electric-green/10 transition-colors duration-500"></div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {!useMobileProjectSheet ? (
                <AnimatePresence onExitComplete={handleProjectModalExitComplete}>
                    {selectedId && activeProject && (
                        <div className={modalViewportClass}>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => { void handleProjectClose(); }}
                                    transition={useCompactProjectModal
                                        ? { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                                        : quality.modalTransition}
                                    className={`fixed inset-0 bg-dark-void/90 cursor-pointer ${quality.allowBlur ? 'backdrop-blur-xl' : ''}`}
                                />

                                <motion.button
                                    initial={useCompactProjectModal ? { opacity: 0, scale: 0.96 } : { opacity: 0 }}
                                    animate={useCompactProjectModal ? { opacity: 1, scale: 1 } : { opacity: 1 }}
                                    exit={useCompactProjectModal ? { opacity: 0, scale: 0.96 } : { opacity: 0 }}
                                    transition={useCompactProjectModal
                                        ? { duration: 0.2, delay: 0.08, ease: [0.16, 1, 0.3, 1] }
                                        : { duration: 0.2, delay: 0.1 }}
                                    onClick={() => { void handleProjectClose(); }}
                                    className={modalCloseClass}
                                >
                                    <X className="w-6 h-6" />
                                </motion.button>

                                <motion.div
                                    layoutId={useCompactProjectModal ? undefined : `project-${selectedId}`}
                                    initial={compactModalMotion?.initial}
                                    animate={compactModalMotion?.animate ?? desktopShellAnimate}
                                    exit={compactModalMotion?.exit}
                                    transition={desktopShellTransition}
                                    onLayoutAnimationComplete={useCompactProjectModal ? undefined : () => {
                                        if (!isClosingRef.current) {
                                            setIsContentClosing(false);
                                            setContentReady(true);
                                        }
                                    }}
                                    className={modalShellClass}
                                    style={useCompactProjectModal ? { transformOrigin: '50% 0%' } : undefined}
                                >
                                    {shouldUseDesktopProjectTransition && (
                                        <motion.div
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-gradient-to-b from-dark-void via-dark-void/78 via-30% to-dark-void/10"
                                            initial={false}
                                            animate={{ opacity: isContentClosing ? 1 : 0 }}
                                            transition={isContentClosing
                                                ? {
                                                    duration: 0.28,
                                                    delay: 0.08,
                                                    ease: [0.32, 0, 0.67, 0],
                                                }
                                                : {
                                                    duration: 0.18,
                                                    ease: [0.16, 1, 0.3, 1],
                                                }}
                                        />
                                    )}
                                    {(isContentReady || quality.tier === 'high' || useCompactProjectModal) && (
                                        <motion.div
                                            initial={compactContentMotion?.initial ?? { opacity: 0 }}
                                            animate={useCompactProjectModal
                                                ? (compactContentMotion?.animate ?? { opacity: 1 })
                                                : (isContentClosing
                                                    ? { opacity: 0 }
                                                    : { opacity: 1 })}
                                            transition={useCompactProjectModal
                                                ? (compactContentMotion?.transition ?? { duration: 0.3 })
                                                : (isContentClosing
                                                    ? { duration: 0.2, ease: [0.4, 0, 1, 1] }
                                                    : { duration: 0.3, ease: [0.16, 1, 0.3, 1] })}
                                            className="contents"
                                        >
                                            {projectDetailPanels}
                                        </motion.div>
                                    )}
                                </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            ) : null}
            {useMobileProjectSheet ? mobileProjectSheetPortal : null}
        </section>
    );
};

export { FeaturedProjects };
