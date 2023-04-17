import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme/theme'
import '@fontsource/play/400.css'
function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
export default App
