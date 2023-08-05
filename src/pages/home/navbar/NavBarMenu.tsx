import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Settings from '@mui/icons-material/Settings';
import Logout from '@mui/icons-material/Logout';
import { useAppDispatch, useAppSelector } from '../../../redux/store';
import { logOut } from '../../../redux/slices/auth';
import Avatar from '../../../components/Avatar';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PersonIcon from '@mui/icons-material/Person';
function NavBarMenu({ anchorEl, onClose }: NavBarMenuProps) {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(state => state.auth.user);
    const navigate = useNavigate();
    function handleLogOut() {
        dispatch(logOut());
        onClose();
    }
    function handleSettingClick() {
        toast.info('Function is under development')
        onClose();
    }

    function handleProfileClick() {
        navigate('/home/profile');
        onClose();
    }

    function handleContactClick() {
        navigate('/home/contact');
        onClose();
    }

    const open = Boolean(anchorEl);
    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            onClick={onClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={handleProfileClick}>
                <Box gap={0.5} width={'100%'} display={'flex'} alignItems={'center'}>
                    <ListItemIcon>
                        <Avatar name={currentUser?.displayName} imgUrl={currentUser?.photoUrl} />
                    </ListItemIcon>
                    {currentUser?.displayName ?? 'Profile'}
                </Box>
            </MenuItem>

            <Divider />
            <MenuItem onClick={handleContactClick}>
                <ListItemIcon>
                    <PersonIcon fontSize='small' />
                </ListItemIcon>
                Contacts
            </MenuItem>
            <MenuItem onClick={handleSettingClick}>
                <ListItemIcon>
                    <Settings fontSize="small" />
                </ListItemIcon>
                Settings
            </MenuItem>
            <MenuItem onClick={handleLogOut}>
                <ListItemIcon>
                    <Logout fontSize="small" />
                </ListItemIcon>
                Logout
            </MenuItem>
        </Menu>
    )
}

export default NavBarMenu

type NavBarMenuProps = {
    anchorEl: HTMLElement | null,
    onClose: () => void
}