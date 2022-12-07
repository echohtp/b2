import Link from "next/link"

const Footer = () => {
    return (
        <footer className="flex text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
        <div className='p-4 text-center'>
          Made with ❤️
        </div>
        <div className='flex flex-1 p-4 text-center'>
          <div className='px-2'>
            <Link href="/">Home</Link>
          </div>
          <div className='px-2'>
            <Link href="/">About</Link>
          </div>
        </div>
      </footer>
    )
}

export default Footer