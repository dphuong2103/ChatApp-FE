import { Fab, IconButton, TextField, Typography } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import styles from '../../../../styles/ProfileTab.module.scss';
import { ArrowLeft, Camera, Check } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../redux/store';
import { useEffect, useState } from 'react';
import { Gender, GenderType, User } from '../../../../types/dataType';
import { ZodType, z } from 'zod';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateClassName } from '../../../../utils/generateClassName';
import UploadAvatar from './UploadAvatar';
import { updateUserProfile } from '../../../../redux/slices/auth';
import { closeLoadingSpinner, showLoadingSpinner } from '../../../../redux/slices/loadingSpinner';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


const userSchema: ZodType<User> = z.object({
    id: z.string().nonempty(),
    email: z.string().nonempty().email(),
    displayName: z.string().nonempty('Please enter your name!'),
    photoUrl: z.string().nullish(),
    bio: z.string().nullish(),
    gender: z.enum(['male', 'female', 'other']).nullish(),
    dateOfBirth: z.string().nullish(),
});


function ProfileTab() {
    const navigate = useNavigate();
    const currentUser = useAppSelector(state => state.auth.user);
    const { register, control, handleSubmit, formState: { errors, isDirty }, reset } = useForm<User>({ resolver: zodResolver(userSchema) });
    const { field: { onChange } } = useController({ name: 'gender', control });
    const { field: { onChange: onChangeDateOfBirth, value: dateOfBirth } } = useController({ name: 'dateOfBirth', control });
    const [showUploadAvatar, setShowUploadAvatar] = useState(false);
    const dispatch = useAppDispatch();
    const [gender, setGender] = useState('')

    useEffect(() => {
        if (currentUser) {
            reset(currentUser)
            setGender(currentUser.gender || '');
        }
    }, [currentUser])

    function handleBackClick() {
        navigate('/home/chatlist');
    }

    useEffect(() => {
        if (gender) {
            onChange(gender)
        }
    }, [gender])

    async function onSubmitUpdateUser(values: User) {
        try {
            dispatch(showLoadingSpinner());
            await dispatch(updateUserProfile(values));
            toast.success('User info updated successfully!');
        } catch (err) {
            toast.error('Update user failed, please try again later')
        } finally {
            dispatch(closeLoadingSpinner());
        }
    }


    function handleCloseUploadAvatar() {
        setShowUploadAvatar(false);
    }
    return (
        <div className={styles['profile-tab-container']}>
            <UploadAvatar open={showUploadAvatar} handleClose={handleCloseUploadAvatar} type='UserAvatar' />
            <div className={styles['navgigation-container']}>
                <IconButton onClick={handleBackClick} >
                    <ArrowLeft />
                </IconButton>
                <Typography variant='h5'>Edit Profile</Typography>

            </div>
            <form onSubmit={handleSubmit(onSubmitUpdateUser)}>
                <div className={styles['user-info-scrollable']}>
                    <div className={styles['user-info-container']}>
                        <div className={styles['avatar-section']}>
                            {
                                (currentUser?.photoUrl) ? <div className={styles['avatar-container']} onClick={() => setShowUploadAvatar(true)}>
                                    <img src={currentUser.photoUrl} className={styles['avatar']} />
                                </div>
                                    : <div className={generateClassName(styles, ['avatar-container', 'camera'])} onClick={() => setShowUploadAvatar(true)}>
                                        <Camera color='white' className={styles.camera} />
                                    </div>
                            }
                        </div>
                        <TextField
                            label='Name'
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                            {...register('displayName')}
                            sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                            helperText={errors.displayName?.message}
                            error={!!errors.displayName}
                        />
                        <TextField label='Email' variant="outlined" InputLabelProps={{ shrink: true }} {...register('email')} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} disabled />
                        <TextField label='Bio' placeholder='Enter a short description about your self' rows={5} multiline {...register('bio')} />
                        <FormControl>
                            <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="gender"
                                value={gender}
                                onChange={e => setGender(e.target.value)}
                            >
                                {Object.keys(Gender).map(gender => <FormControlLabel key={gender} value={gender} control={<Radio />} label={Gender[gender as GenderType]} />)}
                            </RadioGroup>
                        </FormControl>
                        <DatePicker label='Date of birth' format='dd/MM/yyyy' value={dateOfBirth ? new Date(dateOfBirth) : null} onChange={(e: Date | null) => {
                            if (e) onChangeDateOfBirth(e.toISOString());
                        }
                        } />
                    </div>

                </div>

                <Fab color="primary" aria-label="add" className={generateClassName(styles, ['btn-floating-action', ...isDirty ? [''] : ['d-none']])} type='submit'>
                    <Check size={32} />
                </Fab>
            </form>

        </div >
    )
}

export default ProfileTab