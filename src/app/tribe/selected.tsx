import React from 'react'
import Username from '../components/UI/username';

type selectedProps = {
    tribe: string | "null";
}

const selected = ({ tribe }: selectedProps) => {
    console.log("selected tribe", tribe);   

  return (
    <>
      <div className='mt-[17%]'>
        <Username username={""} tribe={tribe} OP={false} fire={false} />
      </div>
    </>
  );
}

export default selected