import { Box, ListItemIcon, Menu, MenuItem } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
function MessageActionMenu({ anchorEl, onClose, copy, deleteMessage }: MessageActionMenuProps) {
    const open = Boolean(anchorEl);
    return (
        <Menu open={open} anchorEl={anchorEl}
            onClose={onClose}
            onClick={onClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem onClick={copy}>
                <Box display='flex' justifyContent='flex-start'>
                    <ListItemIcon>
                        <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    Copy
                </Box>

            </MenuItem>
            <MenuItem onClick={deleteMessage}>
                <Box display='flex' justifyContent='flex-start'>
                    <ListItemIcon >
                        <DeleteOutlineIcon />
                    </ListItemIcon>
                    Delete
                </Box>
            </MenuItem>
        </Menu>
    )
}

export default MessageActionMenu

type MessageActionMenuProps = {
    anchorEl: HTMLElement | null,
    onClose: () => void,
    copy: () => Promise<void>,
    deleteMessage: () => Promise<void>
}