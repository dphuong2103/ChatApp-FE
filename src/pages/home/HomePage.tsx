import ChatContextProvider from '../../context/ChatMessageContext';
import styles from '../../styles/HomePage.module.scss';
import NavBar from './navbar/NavBar';
import ChatInfo from './chat-view/side-bar/ChatInfo';
import ChatViewContainer from './chat-view/main-chat-view/ChatViewContainer';
function HomePage() {
    return (
        <div className={styles['homepage-container']}>
            <NavBar />
            <div className={styles['chat-container']}>
                <ChatContextProvider>
                    <ChatViewContainer />
                    <ChatInfo />
                </ChatContextProvider>
            </div>
        </div>
    )
}

export default HomePage