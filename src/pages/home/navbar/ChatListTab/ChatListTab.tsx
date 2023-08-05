import { ArrowLeft, List } from 'phosphor-react';
import SearchBar from '../../../../components/SearchBar'
import styles from '../../../../styles/ChatListTab.module.scss';
import { IconButton } from '@mui/material';
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavBarMenu from '../NavBarMenu';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddGroupChatModal from '../../../../components/AddGroupChatModal/AddGroupChatModal';
function ChatListTab() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [openAddGroupModal, setOpenAddGroupModal] = useState(false);
    function handleSearchInputFocusIn() {
        // setSearchInputFocus(true);
        navigate('/home/chatlist/search');
    }

    function handleOnSearchInputFocusOut() {
        // setSearchInputFocus(false);
    }
    function handleBackClick() {
        setSearchInput('');
        navigate('/home/chatlist/chatrooms')
    }

    function handleSearchInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearchInput(e.target.value);
    }

    function handleMenuClick(e: React.MouseEvent<HTMLElement>) {
        setMenuAnchorEl(e.currentTarget);
    }

    useEffect(() => {
        if (location.pathname === '/home/chatlist/chatrooms') {
            setSearchInput('');
        }
    }, [location.pathname])

    return (
        <div className={styles['chat-list-tab-container']}>
            <div className={styles['navgigation-container']}>
                {
                    location.pathname === '/home/chatlist/search' ?
                        <IconButton onClick={handleBackClick} >
                            <ArrowLeft />
                        </IconButton> :
                        <IconButton onClick={handleMenuClick}>
                            <List />
                        </IconButton>
                }
                <NavBarMenu anchorEl={menuAnchorEl} onClose={() => setMenuAnchorEl(null)} />
                <SearchBar
                    handleFocusIn={handleSearchInputFocusIn}
                    handleFocusOut={handleOnSearchInputFocusOut}
                    value={searchInput}
                    onChange={handleSearchInputChange} />
                <IconButton onClick={() => setOpenAddGroupModal(true)}>
                    <GroupAddIcon />
                </IconButton>
                <AddGroupChatModal open={openAddGroupModal} onClose={() => setOpenAddGroupModal(false)} type='New' />
            </div>
            <Outlet context={{ searchInput, setSearchInput }} />
        </div >
    )
}

export default ChatListTab
type OutletContextType = { searchInput: string, setSearchInput: (value: React.SetStateAction<string>) => void }
export function useSearchInput() {
    return useOutletContext<OutletContextType>();
}