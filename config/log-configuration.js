const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

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
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log', level: 'info' }),
    ]
})

module.exports = logger;
