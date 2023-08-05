import BeatLoader from 'react-spinners/BeatLoader';
import styles from '../styles/LoadingSpinner.module.scss';
function LoadingSpinner() {
    return (
        <>
            <div className={styles.background}></div>
            <div className={styles['spinner__container']}>
                <BeatLoader loading color={'#36b3d6'} />
            </div>
        </>
    )
}

export default LoadingSpinner