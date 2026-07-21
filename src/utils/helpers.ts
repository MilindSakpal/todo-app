export const formatTime = (time: string) => {

    if (!time) return "";

    return time.substring(0,5);

};

export const calculateDuration = (
    start: string,
    end: string
) => {

    if (!start || !end) return "";

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    const diff = endMinutes - startMinutes;

    if(diff <= 0) return "";

    const hours = Math.floor(diff/60);
    const minutes = diff%60;

    if(hours && minutes)
        return `${hours}h ${minutes}m`;

    if(hours)
        return `${hours}h`;

    return `${minutes}m`;

};
