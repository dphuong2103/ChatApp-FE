import { FormControl, InputLabel, OutlinedInput, Typography, Stack } from '@mui/material';
import styles from '../../styles/Auth.module.scss';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { requestResetPasswordByEmail } from '../../firebase/firebase-config';
import { ArrowLeft } from 'phosphor-react';
import { Link } from 'react-router-dom';

function ResetPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    async function sendRequest(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter a valid email');
            return;
        }
        try {
            setIsLoading(true);
            await requestResetPasswordByEmail(email);
            toast.success('An email has been sent, please check your email'); ''
        } catch (err) {
            toast.error('An error has occurred, please try again!')
        }
        finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.background}>
            <div className={styles.container}>
                <Typography variant='h4'>Forgot your password?</Typography>
                <Typography style={{ color: 'gray' }}>Please enter the email address associated with your account and We will email you a link to reset your password.</Typography>
                <form onSubmit={sendRequest}>
                    <Stack spacing={2}>
                        <FormControl variant='outlined'>
                            <InputLabel>Email</InputLabel>
                            <OutlinedInput label="Email"
                                placeholder='Enter your email' value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </FormControl>
                        <LoadingButton
                            fullWidth
                            color="inherit"
                            size="large"
                            type="submit"
                            variant="contained"
                            loading={isLoading}
                            sx={{
                                bgcolor: "text.primary",
                                color: 'white',
                                "&:hover": {
                                    bgcolor: "text.primary",
                                },
                            }}
                        >
                            Send request
                        </LoadingButton>
                    </Stack>
                </form>
                <Link to='/auth/login'>
                    <Stack direction='row' alignItems='center' spacing={0.5}>
                        <ArrowLeft size={32} color={'black'} />
                        <Typography color={'black'}>Go back to login</Typography>
                    </Stack>
                </Link>
            </div>
        </div>
    )
}

export default ResetPassword