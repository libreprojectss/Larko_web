import React, { useState } from 'react';
import QRCode from 'qrcode';


function Qrcode({ queue_token }) {
    const [imageUrl, setImageUrl] = useState('');
    var disableBtn = false;
    function generateQrCode() {
        QRCode.toDataURL(queue_token).then((url) => {
            disableBtn = true;
            setImageUrl(url)
        }).catch(err => console.log(err))
    }

    return (
        <>
            <div className='mt-6'>
                <button
                    disabled={disableBtn}
                    onClick={generateQrCode}
                    className='w-full bg-transparent px-5 py-3 text-gray-700 hover:text-white hover:bg-green-600 font-bold  rounded-full  cursor-pointer border border-green-700 disabled:bg-slate-500 disabled:text-white disabled:border-none disabled:cursor-not-allowed'
                >Generate Token</button>
            </div>

            {imageUrl ? (
                <div className='flex justify-center items-center'>
                    <a href={imageUrl} download>
                        <img src={imageUrl} alt="img" width='250px' height='250px'/>
                    </a>
                </div>) : null}
            <hr className='my-8' />
        </>
    )

}

export default Qrcode;