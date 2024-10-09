// eslint-disable-next-line import/no-unresolved
import { useState } from '../../../../scripts/preact-hooks.js';
import { toClassName } from '../../scripts/aem.js';
import { h } from '../../scripts/preact.js';
import htm from '../../scripts/htm.js';

const html = htm.bind(h);

const TabComponent = ({ children }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabs = children.map((child, i) => {
    const id = toClassName(child.props.label);
    return {
      id,
      label: child.props.label,
      content: child,
      isSelected: i === selectedIndex,
    };
  });

  const handleTabClick = (index) => {
    setSelectedIndex(index);
  };

  return html`
    <div className="tabs">
        <div className="tabs-list" role="tablist">
            ${tabs.map((tab, i) => tab?.label && html`
            <button
                key=${tab.id}
                id=${`tab-${tab.id}`}
                className="tabs-tab"
                role="tab"
                type="button"
                aria-controls=${`tabpanel-${tab.id}`}
                aria-selected=${tab.isSelected}
                onClick=${() => handleTabClick(i)}
            >
                ${tab.label}
            </button>`)}
        </div>
        ${tabs.map((tab) => html`
        <div
            key=${tab.id}
            id=${`tabpanel-${tab.id}`}
            className="tabs-panel"
            role="tabpanel"
            aria-labelledby=${`tab-${tab.id}`}
            aria-hidden=${!tab.isSelected}
            style=${{ display: tab.isSelected ? 'block' : 'none' }} 
        >
            ${tab.content}
        </div>`)}
    </div>`;
};

export default TabComponent;
