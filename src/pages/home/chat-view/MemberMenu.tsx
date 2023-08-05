import { MenuItem } from '@mui/material';
import { forwardRef } from 'react';
import styles from '../../../styles/MemberMenu.module.scss'

const MemberMenu = forwardRef<HTMLDivElement, NavBarMenuProps>(({ anchorEl, onRemoveFromChatClick }, ref) => {
    return <div style={{
        ...anchorEl ? {
            position: 'absolute',
            top: anchorEl?.getBoundingClientRect().top - 70,
            right: 40,
            backgroundColor: 'white'
        } : {
            display: 'none'
        }
    }} className={styles['member-menu-container']}
        ref={ref}
    >
        <MenuItem onClick={onRemoveFromChatClick}>
            Remove from chat
        </MenuItem>
    </div >
})
export default MemberMenu;
type NavBarMenuProps = {
    anchorEl: HTMLElement | null,
    onClose: () => void,
    onRemoveFromChatClick: () => void
}