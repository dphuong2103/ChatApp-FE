import styles from '../../../../styles/AttachedFiles.module.scss';
import AttachedFile from './AttachedFile';
function AttachedFiles({ file, onFileDeselect }: AttachedFilesProps) {

    return <div className={styles['attached-files-container']}>
        <AttachedFile file={file} onFileDeselect={onFileDeselect} />
    </div>
}
export default AttachedFiles

type AttachedFilesProps = {
    file: File,
    onFileDeselect: () => void
}