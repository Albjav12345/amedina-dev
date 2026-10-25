import React from 'react';
import { dispatchSectionNavigation, isPlainLeftClick, setRequestedProjectId } from '../../utils/sectionRouting';

export default function ProjectReference({ project, children, className = '', ...anchorProps }) {
    return (
        <a
            {...anchorProps}
            href={`/projects?focus=${project.id}`}
            className={className}
            onClick={event => {
                if (!isPlainLeftClick(event)) return;
                event.preventDefault();
                setRequestedProjectId(project.id, 'focus');
                dispatchSectionNavigation('projects', { skipScroll: true });
                const url = new URL(window.location.href);
                url.pathname = '/projects';
                url.searchParams.delete('project');
                url.searchParams.set('focus', project.id);
                window.history.replaceState(window.history.state, '', url);
                window.dispatchEvent(new CustomEvent('project:focus-request', { detail: { projectId: project.id } }));
            }}
        >{children}</a>
    );
}
