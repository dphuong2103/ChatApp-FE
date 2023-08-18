import styles from '../styles/Avatar.module.scss';
import { useState } from 'react';
import { generateClassName } from '../utils/generateClassName';
function stringToColor(string: string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

function Avatar({ name, imgUrl, onClick, size}: AvatarProps) {
    const [error, setError] = useState<React.SyntheticEvent<HTMLImageElement, Event> | null>(null);
    const sz = size ? `${size}rem` : undefined;
    const fontSize = size ? `${size / 2}rem` : undefined;
    let backgroundColor = undefined;
    if ( name) backgroundColor = (error || !imgUrl) ? stringToColor(name) : undefined;
    return <div className={generateClassName(styles, ['avatar-container', ...size ? [] : ['no-size']])} onClick={onClick} style={{
        backgroundColor: backgroundColor,
        ...onClick ? { cursor: 'pointer' } : {},
        width: sz,
        height: sz,
        maxHeight: sz,
        maxWidth: sz,
        fontSize: fontSize
    }}>
        {
            (error || !imgUrl) ? `${name?.charAt(0).toUpperCase()}` : <img src={imgUrl} onError={e => setError(e)} className={styles.avatar} />
        }
    </div>
}


export default Avatar

type AvatarProps = {
    id?: string,
    name?: string,
    imgUrl?: string | null,
    onClick?: () => void,
    size?: number;
}