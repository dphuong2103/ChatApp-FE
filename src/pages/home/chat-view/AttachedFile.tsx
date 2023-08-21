import { X } from 'phosphor-react';
import FileIcon from '../../../components/FileIcon';
import styles from '../../../styles/AttachedFile.module.scss';
import { generateClassName } from '../../../utils/generateClassName';
import { isImageFromFileName } from '../../../helper/getFileExtensionImage';
import { useMemo } from 'react';

function AttachedFile({ file, onFileDeselect }: AttachedFileProps) {
    const isImage = useMemo(() => isImageFromFileName(file.name), [file.name]);

    return (
        <div className={styles['attached-file-container']}>
            {
                isImage ? <img src={URL.createObjectURL(file)}  className={styles.images}/> : <FileIcon extension={file.name} />
            }

            <button className={generateClassName(styles, ['btn', 'remove'])} onClick={onFileDeselect}>
                <X />
            </button>
        </div>
    )
}

export default AttachedFile

type AttachedFileProps = {
    file: File,
    onFileDeselect: () => void
}