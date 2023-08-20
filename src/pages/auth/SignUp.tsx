import { FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import styles from '../../styles/Auth.module.scss';
import { LoadingButton } from "@mui/lab";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z, ZodType } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpWithEmailAndPassword } from '../../redux/slices/auth';
import { useAppDispatch } from '../../redux/store';
import { FirebaseError } from 'firebase/app';
import { toast } from 'react-toastify';

export type UserSignUpForm = {
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
}
const userSignUpSchema: ZodType<UserSignUpForm> = z.object({
    email: z.string().nonempty("Please enter your email!").email("Email format is not correct"),
    displayName: z.string().nonempty("Please enter your email!"),
    password: z.string().nonempty().min(6, "Password must contain at least 6 characters"),
    confirmPassword: z.string().nonempty(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"]
});

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

    const { register, handleSubmit, formState: { errors }
    } = useForm<UserSignUpForm>({ resolver: zodResolver(userSignUpSchema) });

    const onSubmit = async (data: UserSignUpForm) => {
        try {
            setIsLoading(true);
            await dispatch(signUpWithEmailAndPassword(data));
        }
        catch (err) {
            if (err instanceof FirebaseError) {
                toast.error(err.message);
            } else {
                toast.error('Cannot sign up now, please try again later!');
            }
        }
        finally {
            setIsLoading(false);
        }

    }

    return (
        <div className={styles.background}>
            <div className={styles.container}>
                <Typography variant='h3'>SIGN UP!</Typography>
                <Stack direction='row' spacing={0.5} alignItems='center'>
                    <Typography>Already have an account?</Typography>
                    <Link to='/auth/login'><Typography color={'#307fce'}>Log in!</Typography></Link>
                </Stack>

                <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>

                    {/* Email */}
                    <FormControl variant="outlined" sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}>
                        <InputLabel>Email</InputLabel>
                        <OutlinedInput
                            label='Email'
                            placeholder='Enter your email address'
                            {...register('email')}
                        />
                        <FormHelperText error>{errors.email?.message}</FormHelperText>
                    </FormControl>

                    {/* Name */}
                    <FormControl variant="outlined" sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}>
                        <InputLabel>Name</InputLabel>
                        <OutlinedInput
                            label='name'
                            placeholder='Enter your name'
                            {...register('displayName')}
                        />
                        <FormHelperText error>{errors.displayName?.message}</FormHelperText>
                    </FormControl>

                    {/* Password */}
                    <FormControl variant="outlined" sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                    >
                        <InputLabel>Password</InputLabel>
                        <OutlinedInput
                            type={showPassword ? 'text' : 'password'}
                            {...register('password')}
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
                        <FormHelperText error>{errors.password?.message}</FormHelperText>
                    </FormControl>

                    {/* Confirm password */}
                    <FormControl
                        variant="outlined"
                        sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}

                    >
                        <InputLabel>Confirm password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmPassword')}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowConfirmPassword}
                                        edge="end"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                            label="Confirm password"
                            placeholder='Confirm your password'

                        />
                        <FormHelperText error>{errors.confirmPassword?.message}</FormHelperText>
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
                        Sign up
                    </LoadingButton>

                </form>
            </div>
        </div>
    )
}

export default SignUp