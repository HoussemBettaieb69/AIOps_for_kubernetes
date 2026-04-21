import { createContext, useContext, useState } from 'react'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const [alertContext, setAlertContext] = useState(null)
  return (
    <ChatContext.Provider value={{ alertContext, setAlertContext }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  return useContext(ChatContext)
}