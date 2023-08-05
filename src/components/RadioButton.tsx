import { Typography } from '@mui/material';
import styles from '../styles/RadioButton.module.scss';
function RadioButton({ value, children, checked, onChange }: ToggleButtonProps) {
    return <>
        <input value={value} type='radio' name='toggleButton' id={children} className={styles['input']} checked={checked} onChange={onChange} />
        <label htmlFor={children} className={styles['label']}>
            <Typography variant='body2' component='span'>{children}</Typography>
        </label>
    </>
}
export default RadioButton;

type ToggleButtonProps = {
    checked: boolean,
    children: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    value: string
}