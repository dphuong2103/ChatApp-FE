import { isImageFromFileName, isVideoFromFileName } from '../../../../helper/getFileExtensionImage'
import { Message } from '../../../../types/dataType'
import AudioMessage from '../AudioMessage'
import CancelledFileMessage from '../CancelledFileMessage'
import DownloadFileMessage from '../DownloadFileMessage'
import ErrorMessageFile from '../ErrorMessageFile'
import ImageMessage from '../ImageMessage'
import UploadAudioMessage from '../UploadAudioMessage'
import UploadFileMessage from '../UploadFileMessage'
import VideoMessage from './VideoMessage'

function MessageFile({ message }: MessageFile) {
    if (message.fileStatus === 'Error') {
        return <ErrorMessageFile message={message} />
    }

    if (message.type === 'Files') {
        if (message.fileStatus === 'InProgress') {
            return <UploadFileMessage message={message} />
        }

        if (message.fileStatus === 'Cancelled') {
            return <CancelledFileMessage message={message} />
        }

        if (isImageFromFileName(message.fileName)) {
            return <ImageMessage message={message} />
        }
        if (isVideoFromFileName(message.fileName)) {
            return <VideoMessage message={message} />
        }

        return <DownloadFileMessage message={message} />

    }

    else {
        if (message.fileStatus === 'InProgress') {
            return <UploadAudioMessage />
        }
        return <AudioMessage message={message} />
    }

}

export default MessageFile

type MessageFile = {
    message: Message & {
        type: 'Files' | 'AudioRecord'
        fileStatus: 'Done' | 'InProgress' | 'Cancelled' | 'Error'
    }
}