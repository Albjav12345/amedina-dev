import React, { useId, useRef, useState } from 'react';
import WorkflowDiagram from '../common/WorkflowDiagram';

export default function ProjectWorkflows({ project }) {
    const [selected, setSelected] = useState(0);
    const tabs = useRef([]);
    const id = useId();
    const workflows = project.workflows?.length ? project.workflows : [{ title: '', steps: project.arch }];
    const active = workflows[selected];

    function handleKeyDown(event, index) {
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % workflows.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + workflows.length) % workflows.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = workflows.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        setSelected(next);
        tabs.current[next]?.focus();
    }

    return (
        <div className="project-workflows rounded-xl border border-white/10 bg-white/5">
            {workflows.length > 1 && (
                <div role="tablist" aria-label="Project workflows" className="flex border-b border-white/10 p-2 gap-1">
                    {workflows.map((workflow, index) => (
                        <button
                            key={workflow.title}
                            ref={node => { tabs.current[index] = node; }}
                            id={`${id}-tab-${index}`}
                            type="button"
                            role="tab"
                            aria-selected={selected === index}
                            aria-controls={`${id}-panel`}
                            tabIndex={selected === index ? 0 : -1}
                            onClick={() => setSelected(index)}
                            onKeyDown={event => handleKeyDown(event, index)}
                            className={`flex-1 min-w-0 cursor-pointer rounded-md px-2 py-2.5 font-mono text-[9px] uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan ${selected === index ? 'bg-electric-cyan/10 text-electric-cyan' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
                        >{workflow.title}</button>
                    ))}
                </div>
            )}
            <div
                id={`${id}-panel`}
                role={workflows.length > 1 ? 'tabpanel' : undefined}
                aria-labelledby={workflows.length > 1 ? `${id}-tab-${selected}` : undefined}
                tabIndex={workflows.length > 1 ? 0 : undefined}
                className={workflows.length > 1 ? 'px-3 py-2 md:px-4' : 'p-4 md:p-6'}
            >
                <WorkflowDiagram key={selected} steps={active.steps} />
            </div>
        </div>
    );
}
