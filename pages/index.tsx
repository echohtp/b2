import Head from 'next/head'
import { gql } from '@apollo/client'
import { Tab } from '@headlessui/react'
import Footer from '../components/Footer'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import client from '../client'
import { PublicKey } from '@solana/web3.js'
import { NftEdit } from '../components/NftEdit'
import { toast } from 'react-toastify'
import NftMint from '../components/NftMint'
import CloseNfts from '../components/CloseNfts'
import QuickMint from '../components/QuickMint'
import UpdateUA from '../components/updateUA'

const GET_NFTS = gql`
query GetNfts($owners: [PublicKey!], $limit: Int!, $offset: Int!) {
  nfts(owners: $owners, limit: $limit, offset: $offset) {
    address
    mintAddress
    name
    description
    image
    owner {
      address
      associatedTokenAccountAddress
    }
  }
}
`

const tools = [
  { title: 'Airdrop Cannon', href: 'airdropcannon', subtitle: 'Send NFTs to wallets. Pretty simple.', icon: '💣'},
  { title: 'Burn', href: 'burn', subtitle: 'Nuke NFTs you don\'t want anymore.', icon: '🔥' },
  { title: 'Change Update Auth', href: 'updateua', subtitle: 'Transfer update authority of NFTs.', icon: '🤝' },
  { title: 'Close Accts', href: 'closeaccts', subtitle: 'Reclaim any sol rent from old accounts.', icon: '💸' },
  { title: 'Edition Printer', href: 'editionprinter', subtitle: 'Make prints from your Master Edition NFTs.', icon: '📠' },
  { title: 'Holder Snapshot', href: 'holdersnapshot', subtitle: 'See what wallets hold your NFTs.', icon: '📸' },
  { title: 'Mass Send', href: 'multisend', subtitle: 'Send a bunch of NFTs to another wallet.', icon: '📮' },
  { title: 'Mint Hash', href: 'minthash', subtitle: 'Get the mint hash from your NFTs.', icon: '📋' },
  { title: 'NFT Editor', href: 'editor', subtitle: 'Update the metadata of your NFTs.', icon: '✏️' },
  { title: 'NFT Minter', href: 'nftmint', subtitle: 'Mint yourself some NFTs.', icon: '🖼️' },
  { title: 'Quick Fix', href: 'quickfix', subtitle: 'Replace metadata of your NFTs.', icon: '🛠️' },
  { title: 'Quick Mint', href: 'quickmint', subtitle: 'Have metadata? Mint now.', icon: '🏃' },
  { title: 'Viewer', href: 'viewer', subtitle: 'Take a peek inside a wallet.', icon: '🔎' },
  // { title: 'CANDY MACHINE MINTS', href: 'cmmints' }
]

export default function Home() {

  const wallet = useWallet()
  const [nfts, setNfts] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [loadingNfts, setLoadingNfts] = useState<boolean>(false)
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
  const [toolTab, setToolTab] = useState<{ title: string, href: string } | null>(null)

  useMemo(() => {

    if (wallet.disconnecting) {
      setSelectedTabIndex(0)
      setToolTab(null)
      setActions([])
      setNfts([])
    }


    if (wallet.connected) {
      setLoadingNfts(true)
      client
        .query({
          query: GET_NFTS,
          variables: {
            owners: [wallet.publicKey?.toBase58()],
            offset: 0,
            limit: 10000
          }
        })
        .then(res => {
          setNfts(res.data.nfts)
          setLoadingNfts(false)
        })
    } else {
      setNfts([])
      setLoadingNfts(false)
    }
  }, [wallet])



  return (
    <>
      <div className='container mx-auto dark:bg-gray-800 dark:text-gray-100 text-gray-800 max-w-full max-h-fit px-10'>
        <Head>
          <title>🍌 Banana Tools</title>
          <meta name="description" content="" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className='relative pt-4'>
          <div className="absolute right-0">
            <WalletMultiButton />
          </div>
        </div>


        <div className="max-h-fit pb-4">
          <Tab.Group key={selectedTabIndex} defaultIndex={selectedTabIndex} onChange={index => setSelectedTabIndex(index)}>
            <Tab.List className="font-bold pt-4 py-8 grid grid-flow-row">
              <Tab className="pr-8 text-4xl ui-selected:underline">
                🍌 Tools
              </Tab>
              {wallet.connected &&
                <Tab className="text-4xl pr-8 ui-selected:underline">
                  Your NFTs</Tab>
              }
              {
                toolTab && <Tab className="text-4xl ui-selected:underline">{toolTab.title}</Tab>
              }
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="grid gap-10 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 max-w-[1000px] mx-auto">
                  {tools.map((t, idx) => (
                    <button key={idx} className='p-10 rounded-lg text-center dark:hover:bg-gray-600 lg:max-w-sm dark:bg-gray-700 bg-amber-500 hover:bg-amber-600'
                      onClick={() => {
                        if (wallet.connected) {
                          setToolTab(t)
                          setSelectedTabIndex(2)
                        }else{
                          toast.warning("Connect to use 🔌")
                        }
                      }}
                    >
                      <div className='text-4xl'>{t.icon}</div>
                      <div className='text-xl font-bold py-1'>{t.title}</div>
                      <div className='text-sm'>{t.subtitle}</div>
                    </button>))}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="h-max-fit">
                  <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'>
                    {loadingNfts && <span className='h-max-fit'>Loading Logo goes here</span>}
                    {nfts.map((e, idx) => (
                      <div className="relative card w-86 bg-base-100 shadow-xl image-full min-h-[500px]" key={idx}>
                        <figure><img src={e.image} /></figure>
                        <div className="card-body">
                          <h2 className="card-title">{e.name}</h2>
                          <p className=''>{e.description}</p>
                          <div className="card-actions justify-end">
                            <div className="dropdown dropdown-top dropdown-end">
                              <label tabIndex={0} className="btn m-1 border-2 rounded-full bg-transparent">...</label>
                              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 bg-black">
                                <li><a onClick={() => {
                                  let _actions = actions
                                  let destination = prompt("Please enter a desination")
                                  try {
                                    let destPK = new PublicKey(destination!)
                                    _actions.push({
                                      action: "printEdition",
                                      token: e.mintAddress,
                                      destination
                                    })
                                    setActions(_actions)
                                  } catch (e: any) {
                                    alert("Not a valid destination")
                                  }
                                }}>Print Edition</a></li>
                                <li><a onClick={() => {
                                  let _actions = actions
                                  let destination = prompt("Please enter a desination")
                                  try {
                                    let destPK = new PublicKey(destination!)
                                    _actions.push({
                                      action: "sendNft",
                                      token: e.mintAddress,
                                      destination
                                    })
                                    setActions(_actions)
                                  } catch (e: any) {
                                    alert("Not a valid destination")
                                  }
                                }}>Send NFT</a></li>
                                <li><a onClick={() => {
                                  let _actions = actions
                                  _actions.push({
                                    action: "burn",
                                    token: e.mintAddress
                                  })
                                  setActions(_actions)
                                }}>Burn</a></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {actions.length > 0 && <div className="fixed bottom-0 left-0 bg-green-800 w-screen h-12 z-40 px-4">
                    Sticks to bottom, covers width of screen <button className='btn z-20' onClick={() => {
                      console.log("ok")
                    }}>Minimize</button>
                  </div>}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="h-screen">
                  {toolTab?.href == "editor" && <NftEdit />}
                  {toolTab?.href == "nftmint" && <NftMint />}
                  {toolTab?.href == "closeaccts" && <CloseNfts />}
                  {toolTab?.href == "quickmint" && <QuickMint />}
                  {toolTab?.href == "updateua" && <UpdateUA nfts={nfts} />}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div >
      </div>
      <Footer />
    </>
  )
}
