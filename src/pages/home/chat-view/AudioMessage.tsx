import { Message } from '../../../types/dataType';
import styles from '../../../styles/AudioMessage.module.scss';
import { useEffect, useRef, useState } from 'react';
import { Microphone, Pause, Play } from 'phosphor-react';
import { MessageAPI } from '../../../api';
import { chatRoomFileRef } from '../../../firebase-config';
import fixWebmDuration from 'webm-duration-fix';
import { recordingDuration } from '../../../helper/dateTime';
import { ClipLoader } from 'react-spinners';
function AudioMessage({ message }: AudioMessageProps) {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);


    function handleControlClick() {
        if (!audioRef.current) return;
        if (!playing) {
            setPlaying(true);
            audioRef.current.play();
        }
        else {
            setPlaying(false);
            audioRef.current.pause();
        }
    }

    useEffect(() => {
        handleGetAudio();
        let interval: NodeJS.Timer;
        async function handleGetAudio() {
            try {

                var audioData = await MessageAPI.getAudioBlob(chatRoomFileRef(message.chatRoomId, message.id));
                //Error: duration is infinity, used fixWebmDurationfor to fix
                const fixBlob = await fixWebmDuration(audioData);
                audioRef.current = new Audio(URL.createObjectURL(fixBlob));
                audioRef.current.onloadeddata = () => {
                    setLoading(false);
                    setRemainingTime(audioRef.current!.duration)
                }
                audioRef.current.onplaying = () => {
                    interval = setInterval(() => {
                        if (!audioRef.current) return;
                        const remainingTime = audioRef.current?.duration - audioRef.current?.currentTime;
                        setRemainingTime(remainingTime);

                    }, 100);
                }
                audioRef.current.onpause = () => {
                    clearInterval(interval);
                }
                audioRef.current.onended = () => {
                    clearInterval(interval);
                    audioRef.current!.currentTime = 0;
                    setPlaying(false);
                    setRemainingTime(audioRef.current!.duration);
                }
            } catch (err) {
                console.error(err)
            }
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                clearInterval(interval);
                setPlaying(false);
            }
        }
    }, [])

    return <div className={styles['audio-message-container']}>
        {
            loading ? <div className={styles['loading-container']}>
                <ClipLoader className={styles['spinner']} color="#36d7b7" />
                <div className={styles['icon-container']}>
                    <Microphone size={24} />
                </div>
            </div>
                : <>
                    <button className={styles['control-btn']} onClick={handleControlClick}>
                        {
                            playing ? <Pause /> : <Play />

                        }

                    </button>

                    <span>{audioRef.current && recordingDuration(remainingTime)}</span>
                </>
        }
    </div>

}

export default AudioMessage;

type AudioMessageProps = {
    message: Message & {
        type: 'AudioRecord',
        fileStatus: 'Done'
    }
}