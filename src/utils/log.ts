const log = (message: string) => {
  if (process.env.DEVELOPMENT === 'true') {
    console.log(`[DEBUG] ${message}`);
  }
};

export default log;