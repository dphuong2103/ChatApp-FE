import { LocalizationProvider } from '@mui/x-date-pickers'
import Call from '../../context/Call'
import ChatRoomSummaryContext from '../../context/ChatRoomSummaryContext'
import CurrentChatRoom from '../../context/CurrentChatRoom'
import HubConnection from '../../context/HubConnection'
import HomePage from './HomePage'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';
export default function HomepageWrapper() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
            <HubConnection>
                <ChatRoomSummaryContext>
                    <CurrentChatRoom>
                        <Call>
                            <HomePage />
                        </Call>
                    </CurrentChatRoom>
                </ChatRoomSummaryContext>
            </HubConnection>
        </LocalizationProvider>
    )
}


