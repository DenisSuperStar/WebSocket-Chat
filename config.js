module.exports = {
    PORT: process.env.LAUNCH_PORT || 8000,
    DATABASE_HOST: `${process.env.DATABASE_HOST}`,
    DATABASE_NAME:`${process.env.DATABASE_NAME}`,
    DATABASE_CONF: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}