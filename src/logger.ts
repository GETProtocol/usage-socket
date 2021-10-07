import winston from "winston";
const { combine, timestamp, logstash } = winston.format;

const logger = winston.createLogger({
  format: combine(timestamp(), logstash()),
  defaultMeta: { service: "usage-socket" },
  transports: [new winston.transports.Console()],
});

export default logger;
