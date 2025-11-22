// pages/_app.js
import '../styles/globals.css' // if you have global css
import { SettingsProvider } from '../components/SettingsModal'

export default function MyApp({ Component, pageProps }) {
  return (
    <SettingsProvider>
      <Component {...pageProps} />
    </SettingsProvider>
  )
}
