import './PageContainer.scss';

function PageContainer({ children, className = '' }) {
    return (
        <div className={`page-container${className ? ' ' + className : ''}`}>
            <div className="page-container__inner">
                {children}
            </div>
        </div>
    );
}

export default PageContainer;
