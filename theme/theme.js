import { extendTheme } from '@chakra-ui/react'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({ 
  fonts: {
    heading: `'Play', sans-serif`,
    body: `'Play', sans-serif`,
  },
 })

export default theme
