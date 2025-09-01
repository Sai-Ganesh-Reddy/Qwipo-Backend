export const success = (res, data = null, message = 'Success') => {
    res.json({ success: true, message, data });
};

export const error = (res, message = 'Error', status = 400) => {
    res.status(status).json({ success: false, message });
};
