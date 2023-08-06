import { User } from '../../types/dataType'
import styles from '../../styles/Partner.module.scss';
import Avatar from '../Avatar';
import { Typography } from '@mui/material';
import { generateClassName } from '../../utils/generateClassName';
function Partner({ partner, checked, onClick, isMember }: PartnerProps) {
  return <div className={generateClassName(styles, ['user-container', ...isMember ? ['light'] : []])} onClick={isMember ? undefined : onClick}>
    <input type='checkbox' checked={checked || isMember || false} readOnly />
    <Avatar name={partner.displayName} imgUrl={partner.photoUrl} />
    <Typography variant='body1'>{partner.displayName}</Typography>
    {
      isMember && <Typography fontSize='0.8rem'>Already a member</Typography>
    }
  </div>
}

export default Partner

type PartnerProps = {
  partner: User,
  checked: boolean,
  onClick: () => void,
  isMember?: boolean
}