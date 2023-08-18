import { X } from 'phosphor-react';
import FileIcon from '../../../components/FileIcon';
import styles from '../../../styles/AttachedFile.module.scss';
import { generateClassName } from '../../../utils/generateClassName';

function AttachedFile({ file, onFileDeselect }: AttachedFileProps) {
    return (
        <div className={styles['attached-file-container']}>
            <FileIcon extension={file.name} />
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