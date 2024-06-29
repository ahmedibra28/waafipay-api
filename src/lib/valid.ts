export const isValidWebsite = (value: string): boolean => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\S*)?$/
  return regex.test(value)
}

export const isValidEmail = (value: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(value)
}

export const isValidMobileNumber = (value: string): boolean => {
  const regex = /^(?:\+?9\d{8}|\+?252\d{9})$/
  return regex.test(value)
}

export const isValidApiKey = (apiKey: string): boolean => {
  return apiKey.startsWith('API-') && apiKey.length > 15
}

export const isValidateWithdrawAccount = (value: string): boolean => {
  const allowedPrefixes = ['107', '6', '7']

  return (
    allowedPrefixes.some((prefix) => value.startsWith(prefix)) &&
    value.length === 9
  )
}

export const isValidHormuudSomnet = (value: string): boolean => {
  if (value.length !== 9) return false

  const providers = {
    hormuud: ['61', '77'],
    somnet: ['68'],
    golis: ['90'],
    telesom: ['63'],
    soltelco: ['67'],
  }

  const { hormuud, somnet, golis, telesom, soltelco } = providers

  const key = value.substring(0, 2)

  const valid = [...hormuud, ...somnet, ...golis, ...telesom, ...soltelco]
  return valid.includes(key)
}
