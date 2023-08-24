import { format } from 'date-fns';
export const dateFormat = 'dd/MM/yyyy';
export function latestMessageTime(request: Date) {
    let date = request.toString();
    if (request.toString().charAt(request.toString().length - 1).toLowerCase() !== 'z') {
        date = `${request.toString()}Z`;
    }
    const today = new Date();
    const messageDate = new Date(`${date}`);
    const todayString = today.toDateString();
    const messageDateString = messageDate.toDateString();
    const dateFormat = 'dd/MM';
    const timeFormat = 'HH:mm';
    if (todayString == messageDateString) {
        return format(messageDate, timeFormat);
    }
    else return format(messageDate, dateFormat);
}

export function
    messageTime(request: Date) {
    let date = request.toString();
    if (request.toString().charAt(request.toString().length - 1).toLowerCase() !== 'z') {
        date = `${request.toString()}Z`;
    }
    const today = new Date();
    const messageDate = new Date(`${date}`);
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

export function recordingDuration(time: number) {
    time = Math.floor(time);
    if (time < 10) {
        return `00:0${time}`
    }
    if (time < 60) {
        return `00:${time}`
    }
    const minutes = Math.floor(time / 60);
    const remaningSeconds = time - minutes * 60;
    const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secondString = remaningSeconds < 10 ? `0${remaningSeconds}` : `${remaningSeconds}`;
    return `${minuteString}:${secondString}`
}
