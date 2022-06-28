const path = require('path')
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const {LoggingWinston} = require('@google-cloud/logging-winston');

const loggingWinston = new LoggingWinston({
    projectId: process.env.PROJECT_ID,
    keyFilename: path.resolve(__dirname,process.env.GOOGLE_APPLICATION_CREDENTIALS) 
});


const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });


const logger = createLogger({
    level:'info',
    format: combine(
        label({label: 'label'}),
        timestamp({format:"YYYY-MM-DD HH:mm:ss.sssZ"}),
        myFormat
        ),
    transports: [
        new transports.File({ filename: path.resolve(__dirname,'../error.log'), level: 'error' }),
        new transports.File({ filename: path.resolve(__dirname,'../combined.log'), level: 'info' }),
        loggingWinston
    ]
})

module.exports = logger;
