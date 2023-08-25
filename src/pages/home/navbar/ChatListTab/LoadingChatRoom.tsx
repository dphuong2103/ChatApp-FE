import { Box, Skeleton } from '@mui/material'

function LoadingChatRoom() {
    return (
        <Box flexDirection='row' display={'flex'} gap={1} padding={1.2}>
            <Skeleton variant="circular" width={48} height={48} style={{ minWidth: '3rem', minHeight: '3rem' }} />
            <Skeleton variant="rounded" width={'100%'} height={64} />
        </Box>
    )
}

export default LoadingChatRoom