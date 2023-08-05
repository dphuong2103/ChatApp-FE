import { format } from 'date-fns';
export const dateFormat = 'dd/MM/yyyy';
export function latestMessageTime(date: Date) {
    const today = new Date();
    const messageDate = new Date(date);
    const todayString = today.toDateString();
    const messageDateString = messageDate.toDateString();
    const dateFormat = 'dd/MM';
    const timeFormat = 'HH:mm';
    if (todayString == messageDateString) {
        return format(messageDate, timeFormat);
    }
    else return format(messageDate, dateFormat);
}

export function messageTime(date: Date) {
    const today = new Date();
    const messageDate = new Date(date);
    const todayString = today.toDateString();
    const messageDateString = messageDate.toDateString();
    const dateFormat = 'dd/MM HH:mm';
    const todayTimeFormat = 'HH:mm';
    if (todayString == messageDateString) {
        return format(messageDate, todayTimeFormat);
    }
    else return format(messageDate, dateFormat);
}

export function formatDateFromObject(dateObject: any) {
    return format(dateObject, dateFormat);
}

export function formatDateFromString(dateString?: string | null) {
    if (!dateString) return;
    const date = new Date(dateString);
    return format(date, dateFormat);
}