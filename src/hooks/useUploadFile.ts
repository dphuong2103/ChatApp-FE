import { StorageError, StorageReference, UploadTask, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';

type UploadStatus = {
    progress: number,
    error?: StorageError | null,
    downloadUrl?: string | null,
    uploadRef?: React.MutableRefObject<UploadTask | null>
}


export const useUploadFiles = (storageRef: StorageReference, file: File | null) => {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ progress: 0 });
    if (!file) return null;
    const uploadRef = useRef<UploadTask | null>(null);
    useEffect(() => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed', (snapshot) => {
            const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setUploadStatus((prevStatus) => { return { ...prevStatus, progress: prog } });
        },
            (error) => setUploadStatus((prevStatus) => { return { ...prevStatus, error: error } }),
            async () => {
                var downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
                setUploadStatus((prevStatus) => { return { ...prevStatus, downloadUrl: downloadUrl } })
            }
        );
        uploadRef.current = uploadTask;
        uploadStatus.uploadRef = uploadRef;
        return () => {
            uploadTask.cancel()
        }
    }, [])

    return uploadStatus;
}