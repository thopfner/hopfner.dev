export class AgentJobValidationError extends Error {
  name = "AgentJobValidationError"
}

export class AgentJobRefusalError extends AgentJobValidationError {
  name = "AgentJobRefusalError"
}

export class AgentJobNotFoundError extends Error {
  name = "AgentJobNotFoundError"
}

export class AgentJobTransitionError extends Error {
  name = "AgentJobTransitionError"
}

export class AgentWorkerConfigError extends Error {
  name = "AgentWorkerConfigError"
}

export class AgentProviderUnavailableError extends Error {
  name = "AgentProviderUnavailableError"
}

export class AgentProviderExecutionError extends Error {
  name = "AgentProviderExecutionError"
}
