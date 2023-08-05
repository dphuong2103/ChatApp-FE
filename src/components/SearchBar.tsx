import { MagnifyingGlass } from 'phosphor-react';
import styles from '../styles/SearchBar.module.scss';
import { MouseEventHandler, useState } from 'react';
import { generateClassName } from '../utils/generateClassName';
function SearchBar({ onClick, handleFocusIn, handleFocusOut, value, onChange, placeholder }: SearchBarProps) {
    const [focus, setFocus] = useState(false);
    function handleInputFocusIn(_e: React.FocusEvent<HTMLDivElement, Element>) {
        setFocus(true);
        handleFocusIn && handleFocusIn();
    }

    function handleInputFocusOut() {
        setFocus(false);
        handleFocusOut && handleFocusOut();
    }

    const containerClassName = focus ? generateClassName(styles, ['search-bar-container', 'focus']) : generateClassName(styles, ['search-bar-container']);
    const inputClassName = focus ? generateClassName(styles, ['input, focus']) : generateClassName(styles, ['input']);
    return (
        <div className={containerClassName} onClick={onClick}>
            <MagnifyingGlass size={25} color={focus ? '#6daff1' : undefined} />
            <input placeholder={placeholder ? placeholder : 'Search'}
                className={inputClassName}
                onFocus={handleInputFocusIn}
                onBlur={handleInputFocusOut}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}

export default SearchBar

type SearchBarProps = {
    onClick?: MouseEventHandler<HTMLDivElement> | undefined,
    handleFocusIn?: () => void,
    handleFocusOut?: () => void,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder?: string
}