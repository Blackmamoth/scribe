import { pino } from "pino";

const LOGGER = pino({
	level: process.env.PINO_LOG_LEVEL || "info",
	timestamp: pino.stdTimeFunctions.isoTime,
	formatters: {
		bindings: (bindings) => {
			return { pid: bindings.pid, host: bindings.hostname };
		},
		level: (label) => {
			return { level: label.toUpperCase() };
		},
	},
});

export default LOGGER;
