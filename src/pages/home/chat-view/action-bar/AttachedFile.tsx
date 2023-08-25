import { X } from 'phosphor-react';
import FileIcon from '../../../../components/FileIcon';
import styles from '@styles/AttachedFile.module.scss';
import { generateClassName } from '@helper/generateClassName';
import { isImageFromFileName, isVideoFromFileName } from '@helper/getFileExtensionImage';

function AttachedFile({ file, onFileDeselect }: AttachedFileProps) {

    return (
        <div className={styles['attached-file-container']}>
            {
                isImageFromFileName(file.name) && <img src={URL.createObjectURL(file)} className={styles.images} />
            }{
                isVideoFromFileName(file.name) && <FileIcon extension='video' />
            }
            {
                !isImageFromFileName(file.name) && !isVideoFromFileName(file.name) && <FileIcon extension={file.name} />
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