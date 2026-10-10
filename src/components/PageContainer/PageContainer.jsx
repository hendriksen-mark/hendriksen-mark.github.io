import './PageContainer.scss';

function PageContainer({ children, className = '', version }) {
    return (
        <div className={`page-container${className ? ' ' + className : ''}`}>
            <div className="page-container__inner">
                {children}
                {version && <div className="page-container__version">v{version}</div>}
            </div>
        </div>
    );
}

export default PageContainer;
