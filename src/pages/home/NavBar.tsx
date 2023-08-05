import { Outlet } from 'react-router-dom'
import styles from '../../styles/NavBar.module.scss';
import { useCurrentChatRoomContext } from '../../helper/getContext';
import { generateClassName } from '../../utils/generateClassName';
function NavBar() {
    const { showChatRoom } = useCurrentChatRoomContext();
    const className = showChatRoom ? generateClassName(styles, ['nav-bar-container', 'd-none']) : generateClassName(styles, ['nav-bar-container']);
    return (
        <div className={className}>
            <Outlet />
        </div>
    )
}

export default NavBar