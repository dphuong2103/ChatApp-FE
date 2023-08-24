import { useEffect, useRef, useState } from 'react';
import styles from '../../../styles/RecordAudio.module.scss';
import { recordingDuration } from '../../../helper/dateTime';
import { PaperPlaneRight, Pause, Play, Record, X } from 'phosphor-react';
import { IconButton, Typography } from '@mui/material';
const maxDuration = (10 * 100)*60*4;
function RecordAudio({ stopRecording, isRecording, onSubmit }: RecordAudioProps) {
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [paused, setPaused] = useState(false);
    const chunksRef = useRef<Blob[]>([]);

    function handleStartInterval(interval: NodeJS.Timeout) {
        return setInterval(() => {
            setDuration(prev => {
                if (prev >= maxDuration) {
                    mediaRecorderRef.current?.stop();
                    clearInterval(interval)
                    handleSubmit();
                    return prev;
                }
                return prev + 100;
            })
        }, 100)
    }
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            handleStartRecording();
        }
        async function handleStartRecording() {

            chunksRef.current = [];
            try {
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

                mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
                    chunksRef.current.push(e.data);
                });


                mediaRecorderRef.current.addEventListener('stop', () => {
                    stream.getTracks().forEach(track => track.stop())
                    clearInterval(interval);
                })

                mediaRecorderRef.current.addEventListener('pause', () => {
                    clearInterval(interval)
                })

                mediaRecorderRef.current.addEventListener('start', () => {
                    interval = handleStartInterval(interval);
                })

                mediaRecorderRef.current.addEventListener('resume', () => {
                    interval = handleStartInterval(interval);
                })

                mediaRecorderRef.current.start(100);

            } catch (err) {
                console.error(err);
            }
        }
        return () => {
            clearInterval(interval);
        }
    }, [isRecording])

    async function handleCancelRecording() {
        mediaRecorderRef.current?.stop();
        stopRecording();
    }

    async function handlePause() {
        mediaRecorderRef.current?.pause();
        setPaused(true);
    }
    async function handleResume() {
        mediaRecorderRef.current?.resume();
        setPaused(false)
    }

    async function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
        e?.preventDefault();
        mediaRecorderRef.current?.stop();
        const newBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await onSubmit(newBlob);
        stopRecording();
    }

    return (
        <form className={styles['record-audio-container']} onSubmit={handleSubmit}>
            <div className={styles['content-container']}>
                <span className={styles['timer']}>
                    {recordingDuration(duration / 1000)}
                </span>
                <div className={styles['title-container']}>
                    <Record size={24} color='red' />
                    <Typography>Recording</Typography>
                </div>
                <div className={styles['actions-container']}>
                    {
                        paused ? <IconButton onClick={handleResume}>
                            <Play size={24} />
                        </IconButton>
                            : <IconButton onClick={handlePause}>
                                <Pause size={24} />
                            </IconButton>
                    }

                    <IconButton onClick={handleCancelRecording}>
                        <X size={24} color='red' />
                    </IconButton>
                </div>

            </div>

            <IconButton className={styles.send} type='submit' >
                <PaperPlaneRight />
            </IconButton>

        </form>
    )
}

export default RecordAudio

type RecordAudioProps = {
    stopRecording: () => void;
    isRecording: boolean;
    onSubmit: (blob: Blob) => Promise<void>
}
