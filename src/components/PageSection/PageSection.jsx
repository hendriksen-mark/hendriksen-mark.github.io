import './PageSection.scss';

function PageSection({ title, titleInline = false, variant, className = '', children }) {
    const sectionClass = `page-section${variant ? ` page-section--${variant}` : ''}${className ? ` ${className}` : ''}`;
    const titleClass = `page-section__title${titleInline ? ' page-section__title--inline' : ''}`;

    return (
        <div className={sectionClass}>
            {title && <h2 className={titleClass}>{title}</h2>}
            {children}
        </div>
    );
}

export default PageSection;
