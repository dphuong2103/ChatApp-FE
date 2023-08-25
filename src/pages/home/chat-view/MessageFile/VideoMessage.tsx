import ReactPlayer from 'react-player'
import { Message } from '../../../../types/dataType'

function VideoMessage({ message }: VideoMessageProps) {
    return <ReactPlayer url={message.fileUrls} controls width={'100%'} height={'100%'} />
}

export default VideoMessage

type VideoMessageProps = {
    message: Message & {
        type: 'Files'
        fileStatus: 'Done'
    }
}