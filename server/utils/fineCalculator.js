// export const calculateFine = (dueDate) => {
//     const finePerHour = 0.1; // $0.10 per hour
//     const now = new Date();

//     if (now > dueDate) {
//         const diffInMs = now - dueDate;
//         const lateHours = Math.ceil(diffInMs / (1000 * 60 * 60)); // Convert ms to hours
//         const fine = lateHours * finePerHour;

//         return parseFloat(fine.toFixed(2)); // round to 2 decimal places
//     }

//     return 0;
// };

export const calculateFine = (dueDate) => {
    const currentTime = new Date();
    const due = new Date(dueDate);

    const diffTime = currentTime - due;

    if (diffTime <= 0) return 0; // No fine if returned on/before due

    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60)); // Convert ms to hours

    const finePerHour = 2; // ₹1 fine per hour

    return diffHours * finePerHour;
};
