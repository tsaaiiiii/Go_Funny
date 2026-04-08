type ApiResponse = {
  status: number
}

export const hasStatus = <TResponse extends ApiResponse, TStatus extends TResponse['status']>(
  response: TResponse | undefined,
  status: TStatus,
): response is Extract<TResponse, { status: TStatus }> => {
  return response?.status === status
}
