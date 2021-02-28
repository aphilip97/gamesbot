const log = (message) => {
    if (process.env.DEVELOPMENT === 'true') {
        console.log(`[DEBUG] ${message}`);
    }
};
export default log;
//# sourceMappingURL=log.js.map