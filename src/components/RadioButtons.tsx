import styles from '../styles/RadioButtons.module.scss';
function ToggleButtons({ children }: ToggleButtons) {

    return <>
        <div className={styles['radio-buttons-container']}>
            {children}
        </div >
    </>
}

export default ToggleButtons;

type ToggleButtons = {
    children: React.ReactNode
}

