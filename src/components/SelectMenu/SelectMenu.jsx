import Select from "react-select";
import "./selectMenu.scss";

const SelectMenu = ({ label, value, placeholder, options, onChange, close = true , multie = false, classOptions = ""}) => {
    const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div className={`dropdown ${classOptions}`}>
            <label htmlFor={selectId}>{label}</label>
            <Select
                inputId={selectId}
                closeMenuOnSelect={close}
                value={value}
                isMulti={multie}
                options={options}
                placeholder={placeholder}
                onChange={(e) => {
                    onChange(e);
                }}
                menuPortalTarget={document.body}
                menuPosition={"fixed"}
                className="generic-text-container"
                classNamePrefix="generic-text"
            />
        </div>
    );
};
export default SelectMenu;