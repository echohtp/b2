import { useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'
import { toast } from 'react-toastify'
import { Tab } from '@headlessui/react'
import * as ga from '../lib/ga'
import { Layers, Square } from 'react-feather';
import {
  Metaplex,
  walletAdapterIdentity,
  toMetaplexFileFromBrowser
} from '@metaplex-foundation/js'
import React from 'react'
import StepperComponent from './CustomerStepper'
import { NFTStorage, File } from 'nft.storage'
const client = new NFTStorage({ token: process.env.NEXT_PUBLIC_NFT_STORAGE! })
import Dropzone from 'react-dropzone'
import { useDropzone } from 'react-dropzone';
import { Loader, Segment } from 'semantic-ui-react'
import { useForm } from 'react-hook-form'


export const NftMint = () => {

  const wallet = useWallet()
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC!)


  const [modalData, setModalData] = useState<any>({
    name: '',
    description: '',
    symbol: '',
    animation_url: '',
    seller_fee_basis_points: 0,
    image: '',
    properties: {
      category: '',
      files: [],
      creators: [{ address: wallet.publicKey?.toBase58(), share: 100 }]
    }
  })

  const metaplex = Metaplex.make(connection).use(
    walletAdapterIdentity(useWallet())
  )

  const [step, setStep] = useState<number>(0)
  const [fileUploading, setFileUploading] = useState<boolean>(false)
  const [nftType, setNftType] = useState<string | null>()
  const [nftFileCid, setNftFileCid] = useState<string | null>()
  const [nftFileType, setNftFileType] = useState<string | null>()
  const [nftEditionSupply, setNftEditionSupply] = useState<number | string | null>()
  const [nftName, setNftName] = useState<string | null>()
  const [showCustomSupply, setShowCustomSupply] = useState<boolean>(false)
  const [royalty, setRoyalty] = useState<number | null>()


  const {
    acceptedFiles,
    fileRejections,
    getRootProps,
    getInputProps
  } = useDropzone({
    accept: {
      'image/jpeg': ['.jpeg'],
      'image/png': ['.png']
    }
  });


  const { register, handleSubmit } = useForm()

  interface creator {
    address: string
    share: string
  }

  interface attribute {
    trait_type: string
    value: string
  }

  interface mintFunction {
    name: string
    description: string
    royalties: number | string
    creators: string | creator[]
    attributes: string | attribute[]
  }


  const mintIt = async (d: any) => {
    console.log(d)
  }

  const editionSupplyRadioChange = (e: any) => {
    console.log(e.target.value)
    if (e.target.value == "custom") {
      setShowCustomSupply(true)
    } else {

      setShowCustomSupply(false)
    }
  }

  return (
    <>
      <form className='mx-auto' onSubmit={handleSubmit(mintIt)}>
        <div className='max-h-screen'>
          <div className='container text-center'>
            <StepperComponent activeStep={step} steps={[{ label: 'Type' }, { label: 'Media' }, { label: 'Details & Mint' }]} />
            {step == 0 &&
              <>
                <h2>What type of NFT</h2>
                <button className='p-10 h-52 w-52 mx-4 rounded-lg text-center hover:bg-gray-600 lg:max-w-sm dark:bg-gray-700 bg-amber-500 hover:bg-amber-600' onClick={() => {
                  setNftType("one")
                  setStep(step + 1)
                }}>
                  <Square className='text-white'  size="48" />
                  1/1
                </button>
                <button className='p-10 h-52 w-52 mx-4 rounded-lg text-center dark:hover:bg-gray-600 lg:max-w-sm dark:bg-gray-700 bg-amber-500 hover:bg-amber-600' onClick={() => {
                  setNftType("edition")
                  setStep(step + 1)
                }}>
                  <Layers className='text-white' size="48" />
                  editions
                </button>
              </>
            }


            {step != 0 &&
              <button className='btn mb-2 bg-transparent text-black border-amber-400' onClick={() => {
                setStep(step - 1)
              }}>Back</button>
            }

            {step == 1 && !nftFileCid &&
              <div className='p-10 text-center rounded-lg dark:hover:bg-gray-600 lg:max-w-sm dark:bg-gray-700 mx-auto border-amber-400 border' >
                <Dropzone onDrop={async (acceptedFiles) => {
                  // console.log(await toMetaplexFileFromBrowser(acceptedFiles[0]))
                  setFileUploading(true)
                  const cid = await client.storeBlob(acceptedFiles[0])
                  setNftFileCid(cid)
                  setNftFileType(acceptedFiles[0].type)
                  setFileUploading(false)
                }}>
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      {!fileUploading &&
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <p>Drag and drop some files here, or click to select files</p>
                        </div>}
                      {fileUploading && <><Segment><Loader active /></Segment></>}
                    </section>
                  )}
                </Dropzone>
              </div>
            }
            {step == 1 && nftFileCid && nftFileType && !fileUploading && ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/bmp", "image/avif", "image/webp"].includes(nftFileType) && <img className="h-48 mx-auto" src={`https://ipfs.io/ipfs/${nftFileCid}`} />}
            {step == 1 && nftFileCid && nftFileType && !fileUploading && ["video/mp4", "video/mpeg", "video/ogg", "video/webm"].includes(nftFileType) && <video className="h-48 mx-auto" src={`https://ipfs.io/ipfs/${nftFileCid}`} />}
            {/* {step == 1 && nftFileCid && nftFileType && fileUploading  && <div className='h-48 w-48'><Segment><Loader active type="pacman" /></Segment></div>} */}
            {step == 1 && nftFileCid && nftFileType && <div className='p-2 m-2 text-center rounded-lg hover:bg-gray-600 lg:max-w-sm bg-gray-700 mx-auto' >
              <Dropzone  onDrop={async (acceptedFiles) => {
                // console.log(await toMetaplexFileFromBrowser(acceptedFiles[0]))
                setFileUploading(true)
                const cid = await client.storeBlob(acceptedFiles[0])
                setNftFileCid(cid)
                setNftFileType(acceptedFiles[0].type)
                setFileUploading(false)
              }}>
                {({ getRootProps, getInputProps }) => (
                  <section >
                    {!fileUploading &&
                      <div {...getRootProps()} >
                        <input {...getInputProps()} />
                        <p>Replace file</p>
                      </div>}
                    {fileUploading && <><Segment><Loader active /></Segment></>}
                  </section>
                )}
              </Dropzone>
            </div>}

            {/* NFT details */}
            {step == 2 &&
              <>
                <div className='grid grid-cols-2 gap-2'>
                  <div className="">

                    {/* Title */}
                    <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text">Name?</span>
                      </label>
                      <input type="text" {...register('name')} placeholder="Type here" className="input input-bordered w-full max-w-xs" onChange={(e) => {
                        setNftName(e.target.value)
                      }} />
                    </div>
                    {/* Description */}
                    <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text">Description?</span>
                      </label>
                      <textarea placeholder="Type here" {...register('description')} className="textarea input-bordered w-full max-w-xs" />
                    </div>
                    {/* Royalties */}
                    <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text">Royalties?</span>
                      </label>
                      <input type="number" max={100} min={0} {...register("royalties")} defaultValue={10} placeholder="10" className="input input-bordered w-full max-w-xs" />
                    </div>
                    {/* Creators  */}
                    {/* <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text">Creators</span>
                      </label>
                      <input type="text" placeholder="Type here" {...register("creators")} className="input input-bordered w-full max-w-xs" />
                      <input type="text" placeholder="Type here" {...register("creators")} className="input input-bordered w-full max-w-xs" />
                    </div> */}

                    {/* Attributes */}
                    <div className="form-control w-full max-w-xs">
                      <label className="label">
                        <span className="label-text">Attributes</span>
                      </label>
                      <input type="text" placeholder="Type here" {...register("attributes")} className="input input-bordered w-full max-w-xs" />
                    </div>

                    {/* Editions  */}
                    {nftType == "edition" &&
                      <div className="form-control w-full max-w-xs">
                        <label className="label">
                          <span className="label-text">Supply - Leave blank for unlimited</span>
                        </label>
                        <fieldset className='py-2' id="group1" >
                          <span className='border py-2 m-4'><input type="radio" value="10" name="group1" onChange={editionSupplyRadioChange} />10</span>
                          <span className='border py-2 m-4'><input type="radio" value="20" name="group1" onChange={editionSupplyRadioChange} />20</span>
                          <span className='border py-2 m-4'><input type="radio" value="50" name="group1" onChange={editionSupplyRadioChange} />50</span>
                          <span className='border py-2 m-4'><input type="radio" value="custom" name="group1" onChange={editionSupplyRadioChange} />Custom</span>
                        </fieldset>
                        {showCustomSupply &&
                          <input type="number" min={2} {...register("supply")} className="input input-bordered w-full max-w-xs" onChange={(e) => {
                            console.log("supply")
                            console.log(e.target.value)
                            setNftEditionSupply(e.target.value)
                          }} />
                        }
                        <input type="number" min={2} {...register("royalty")} placeholder="roy" className="input input-bordered w-full max-w-xs" onChange={(e) => {
                          console.log(e.target.value)
                          setRoyalty(Number(e.target.value))
                        }} />
                      </div>
                    }
                  </div>
                  <div className=''>
                    {nftFileType && ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/bmp", "image/avif", "image/webp"].includes(nftFileType) && <img className="h-48 mx-auto" src={`https://ipfs.io/ipfs/${nftFileCid}`} />}
                    {nftFileType && ["video/mp4", "video/mpeg", "video/ogg", "video/webm"].includes(nftFileType) && <video className="h-48 mx-auto" src={`https://ipfs.io/ipfs/${nftFileCid}`} />}
                    {nftName && <p>{nftName}</p>}
                    <p>NftType: {nftType}</p>
                    <p>AssetType: {nftFileType}</p>
                    {nftType == "edition" && <p>Editions: {nftEditionSupply || "Unlimited"}</p>}
                  </div>
                </div>
              </>
            }


          </div>
          {/* Bottom Buttons */}
          <div className='container text-center'>
            {step == 1 && nftFileCid &&
              <>
                <button className='btn' onClick={() => {
                  setStep(step + 1)
                }}>Next</button>
              </>
            }
            {step == 2 &&
              <>
                <button type='submit' className='btn' onClick={() => {
                }}>Mint</button>
              </>
            }

          </div>
        </div>
      </form>
    </>
  )
}

export default NftMint
