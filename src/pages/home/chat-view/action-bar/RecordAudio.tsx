import { useEffect, useRef, useState } from 'react';
import styles from '@styles/RecordAudio.module.scss';
import { recordingDuration } from '@helper/dateTime';
import { PaperPlaneRight, Pause, Play, Record, X } from 'phosphor-react';
import { IconButton, Typography } from '@mui/material';
import { toast } from 'react-toastify';

//maximum 4 minutes recording
const maxDuration = (10 * 100) * 60 * 4;

function RecordAudio({ stopRecording, isRecording, onSubmit }: RecordAudioProps) {
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [paused, setPaused] = useState(false);
    const chunksRef = useRef<Blob[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    function handleStartInterval() {
        setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= maxDuration) {
                        mediaRecorderRef.current?.stop();
                        intervalRef.current && clearInterval(intervalRef.current)
                        handleSubmit();
                        return prev;
                    }
                    return prev + 100;
                })
            }, 100)
        }, 100);
    }

    useEffect(() => {
        if (isRecording) {
            handleStartRecording();
        }

        async function handleStartRecording() {

            chunksRef.current = [];
            try {
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                // audio/webm
                mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

                mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
                    chunksRef.current.push(e.data);
                });


                mediaRecorderRef.current.addEventListener('stop', () => {
                    stream.getTracks().forEach(track => track.stop())
                    intervalRef.current && clearInterval(intervalRef.current);

                })

                mediaRecorderRef.current.addEventListener('pause', () => {
                    intervalRef.current && clearInterval(intervalRef.current);

                })

                mediaRecorderRef.current.addEventListener('start', () => {
                    handleStartInterval();
                })

                mediaRecorderRef.current.addEventListener('resume', () => {
                    handleStartInterval();

                })

                mediaRecorderRef.current.start(100);

            } catch (err) {
                console.error(err);
                intervalRef.current && clearInterval(intervalRef.current);
                mediaRecorderRef.current?.stop();
                toast.error('Error recording, please try again later!')
            }
        }


        return () => {
            intervalRef.current && clearInterval(intervalRef.current);
            handleCancelRecording();
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
        intervalRef.current && clearTimeout(intervalRef.current)
        setTimeout(async () => {
            mediaRecorderRef.current?.stop();
            const newBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
            await onSubmit(newBlob);
            stopRecording();
        }, 100);
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
