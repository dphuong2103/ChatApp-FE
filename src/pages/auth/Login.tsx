import { Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, TextField, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import styles from '../../styles/Auth.module.scss';
import { LoadingButton } from "@mui/lab";
import { useState } from 'react';
import { GithubLogo, GoogleLogo, TwitterLogo } from 'phosphor-react';
import { Link as MuiLink } from '@mui/material';
import { ZodType, z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '../../redux/store';
import { googleSignIn, loginWithEmailAndPassword } from '../../redux/slices/auth';
import { FirebaseError } from 'firebase/app';
import { toast } from 'react-toastify';


type UserSignInForm = {
    email: string,
    password: string,
}

const userSignInSchema: ZodType<UserSignInForm> = z.object({
    email: z.string().nonempty().email(),
    password: z.string().nonempty().min(6),
});

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<UserSignInForm>({ resolver: zodResolver(userSignInSchema) });
    const dispatch = useAppDispatch();
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    async function handleSignUserIn(values: UserSignInForm) {
        try {
            setIsLoading(true);
            await dispatch(loginWithEmailAndPassword(values.email, values.password));
            toast.success('Logged in successfully!');
        } catch (err) {
            if (err instanceof FirebaseError) {
                toast.error('Invalid email or password, please try again!');
            } else {
                toast.error('Cannot login now, please try again later!');
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        try {
            dispatch(googleSignIn());
            toast.success('Logged in successfully');
        }
        catch (err) {
            if (err instanceof FirebaseError) {
                toast.error('Cannot login now, please try again later!');
            } else {
                toast.error('Cannot login now, please try again later!');
            }
        }
    }

    function otherLogin() {
        toast.warning("Function is under developement, please try again later!");
    }

    const navigate = useNavigate();

    return (
        <div className={styles.background}>
            <div className={styles.container}>
                <Typography variant='h3'>Get started!</Typography>
                <Stack direction='row' spacing={0.5}>
                    <Typography fontSize={'1rem'}>New user?</Typography>
                    <Link to='/auth/signup'><Typography color={'#307fce'}>Create an account</Typography></Link>
                </Stack>
                <form onSubmit={handleSubmit(handleSignUserIn)}>
                    <TextField
                        sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                        label="Email address"
                        variant="outlined"
                        type='email'
                        placeholder='Enter your email'
                        {...register('email')}
                        error={!!errors.email}
                    />
                    <FormControl
                        variant="outlined"
                        sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                    >
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
                            error={!!errors.password}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Password"
                            placeholder='Enter your password'
                        />
                    </FormControl>
                    <Stack justifyContent='flex-end' direction='row'>
                        <MuiLink variant="body2" color="inherit" underline="always"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/auth/resetpassword')}
                        >
                            Forgot password?
                        </MuiLink>
                    </Stack>
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
                        Login
                    </LoadingButton>

                </form>
                <div>
                    <Divider
                        sx={{
                            my: 2.5,
                            typography: 'overline',
                            color: 'text.disabled',
                            '&::before, ::after': {
                                borderTopStyle: 'dashed',
                            },
                        }}
                    >
                        OR
                    </Divider>

                    <Stack direction="row" justifyContent="center" spacing={2}>
                        <IconButton onClick={handleGoogleSignIn}>
                            <GoogleLogo color="#DF3E30" />
                        </IconButton>

                        <IconButton color="inherit" onClick={otherLogin}>
                            <GithubLogo />
                        </IconButton>

                        <IconButton onClick={otherLogin} >
                            <TwitterLogo color="#1C9CEA" />
                        </IconButton>
                    </Stack>
                </div>
            </div>
        </div>
    )
}

export default Login