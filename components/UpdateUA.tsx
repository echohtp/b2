import { useState, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity, Nft } from '@metaplex-foundation/js'
import { materialRenderers, materialCells } from '@jsonforms/material-renderers'
import { Button } from 'antd'
import { gql } from '@apollo/client'
import client from '../client'
import { JsonForms } from '@jsonforms/react'
import * as ga from '../lib/ga'
import { toast } from 'react-toastify'
import { Public } from '@mui/icons-material'
import NftGrid from './NftGrid'


interface UpdateUAProps {
  nfts: any[]
}

export const UpdateUA = (props: UpdateUAProps) => {
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC!)
  const wallet = useWallet()
  const [loading, setLoading] = useState<boolean>(false)
  const initData = { newUpdateAuthority: wallet.publicKey?.toBase58(), nft: '', allOrOne: "Update One" }
  const [data, setData] = useState<any>(initData)
  const [nfts, setNfts] = useState<any[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [schema, setSchema] = useState<object>({})
  const [updateType, setUpdateType] = useState<"one" | "list" | "file" | "all" | "select" | null>()
  const [mintHash, updateMintHash] = useState<string|null>()
  const [newUpdateAuthority, setNewUpdateAuthority] = useState<string|null>()
  const [selectedNfts, setSelectedNfts] = useState<number[]>([])
  
  const GET_NFTS = gql`
    query GetNfts($owners: [PublicKey!], $updateAuthorities: [PublicKey!], $limit: Int!, $offset: Int!) {
      nfts(owners: $owners, updateAuthorities: $updateAuthorities, limit: $limit, offset: $offset) {
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

// useMemo(() => {
//   if (wallet.publicKey?.toBase58()) {
//     client
//       .query({
//         query: GET_NFTS,
//         variables: {
//           owners: [wallet.publicKey?.toBase58()],
//           updateAuthorities: [wallet.publicKey?.toBase58()],
//           offset: 0,
//           limit: 10000
//         }
//       })
//       .then(res => {
//         var mapResult = res.data.nfts.map((n: Nft) => {
//           return { const: n.mintAddress, title: n.name }
//         }, {})
//         setNfts(mapResult)
//         setSchema({
//           type: 'object',
//           properties: {
//             newUpdateAuthority: {
//               type: 'string'
//             },
//             nft: {
//               type: 'string',
//               title: 'Nft',
//               oneOf: mapResult
//             },
            
//             allOrOne: {
//               type: "string",
//               enum: [
//                 "Update One",
//                 "Update All",
//               ]
//           },
//           },
//           required: ['uri']
//         })
//         console.log(mapResult)
//       })
//   } else {
//     setNfts([])
//     setSchema({
//       type: 'object',
//       properties: {
//         newUpdateAuthority: {
//           type: 'string'
//         },
//         nft: {
//           type: 'string',
//           title: 'Nft',
//           enum: []
//         },
//         allOrOne: {
//           type: "string",
//           enum: [
//             "Update One",
//             "Update All",
//           ]
//       },
//       },
//       required: ['uri']
//     })
//   }
// }, [wallet, GET_NFTS])

  const updateIt = async () => {
    console.log(data)


    if (newUpdateAuthority == ''){
      alert('update authority address needed')
      return
    }

    

    if(updateType == "one" && !mintHash){
      alert('mint hash needed')
      return
    }

    //@ts-ignore
    if(updateType == "list" && document.getElementById('inputMintList').files[0]){
      alert('mint list needed')
      return
    }



    setLoading(true)
    try {
      const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity(wallet)
      )

      console.log(data)

      if (data.allOrOne == "Update All"){
        console.log("update all")
        for (var i=0;i < nfts.length; i++){
          const nftPk = new PublicKey(nfts[i].const)
          console.log("nft: ", nftPk.toBase58())
          
          const nft = await metaplex.nfts().findByMint(nftPk).run()
          const newNft = await metaplex
            .nfts()
            .update(nft, {newUpdateAuthority: new PublicKey(data.newUpdateAuthority) })
            .run()
            toast(`updated: ${newNft.nft.mintAddress}`)
        }
        ga.event({action: 'update_ua',
        params: { mint: nfts[i].mintAddress }})
        toast(`done, updated: ${nfts[i].mintAddress}`)
        setLoading(false)
        return // Done
      }

      if (data.allOrOne == "Update One"){
        console.log("update one")
        const nftPk = new PublicKey(data.nft)
        console.log("nft: ", nftPk.toBase58())
        
        const nft = await metaplex.nfts().findByMint(nftPk).run()
        const newNft = await metaplex
          .nfts()
          .update(nft, {newUpdateAuthority: new PublicKey(data.newUpdateAuthority) })
          .run()
          toast(`updated: ${newNft.nft.mintAddress}`)
          ga.event({action: 'update_ua',
        params: { mint: data.nft }})
        toast(`done, updated: ${data.nft}`)
        setLoading(false)
      }
     
    } catch (e: any) {
      alert(`error: ${e.message}`)
      console.error(e.message)
      setLoading(false)
    }
    setLoading(false)
  }


  const options = [
    {value: '', text: '--Choose an option--'},
    {value: 'one', text: 'One NFT '},
    {value: 'all', text: 'All NFTs'},
    {value: 'list', text: 'List Of NFTs (mint hash)'},
    {value: 'select', text: 'Pick some'},
  ];



  return (
    <>
      <div className='p-4 border border-dashed rounded-md'>
        <h2>Update Update Authority</h2>
        <JsonForms
          schema={schema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ errors, data }) => setData(data)}
        />

        <Button
          loading={loading}
          onClick={updateIt}
          className='btn btn-secondary'
        >
          Update It
        </Button>
      </div>

      <div className='grid grid-flow-row'>
        <div>
          <input type={"text"} placeholder="New Update Authority Address" />
        </div>
        <div>
          <select onChange={(e)=>{
            //@ts-ignore
            setUpdateType(e.target.value)
          }}>
            {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
          </select>
        </div>
        <div>
          {updateType == "one" && <input type={"text"} id="inputMintHash" onChange={(e)=>{
            updateMintHash(e.target.value)
          }} />}
          {updateType == "file" && <input type={"file"} id="inputMintList"  />}
          {updateType == "list" && <textarea id=""  />}
          {updateType == "select" && <div className=' h-96 overflow-auto'><NftGrid nfts={props.nfts} selected={selectedNfts} setSelected={setSelectedNfts}/></div>}
        </div>
        <div>
          <button className='btn btn-primary' onClick={updateIt}>Update!</button>
        </div>
      </div>
    </>
  )
}

export default UpdateUA
