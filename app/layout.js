import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from './components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
	title: 'Email Marketing POS',
	description: 'Premium Email Marketing Point of Sale System'
}

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<ToastProvider>
					<div className='app-container'>{children}</div>
				</ToastProvider>
			</body>
		</html>
	)
}
