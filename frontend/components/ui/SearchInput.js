import Image from 'next/image'
import React from 'react'

function SearchInput() {
  return (
    <div className='border border-black sm:border-b-0   flex items-center rounded-sm '>
      <input type="text" placeholder='Search in Categories' className='h-10 w-full py-2 px-3 bg-transparent focus:outline-none placeholder-[#ff0000]' />
      <Image src="/website/assets/images/icons/search.png" alt='search-icon' width={1000} height={1000} className='h-8 w-8'  />
    </div>
  )
}

export default SearchInput
