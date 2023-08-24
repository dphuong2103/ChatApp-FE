import { ClipLoader } from 'react-spinners'
import styles from '../../../styles/UploadAudioMessage.module.scss';
import waveform from '../../../assets/imgs/waveform.svg';

function UploadAudioMessage() {
    return (
        <div className={styles['uploading-audio-message-container']}>
            <button className={styles['spinner-btn']}>
                <ClipLoader className={styles['spinner']} color="#36d7b7" />
            </button>
            <img src={waveform} />
        </div >
    )
}

export default UploadAudioMessage