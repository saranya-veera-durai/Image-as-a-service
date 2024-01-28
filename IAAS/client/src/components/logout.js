import React from 'react'

export default function Logout({ isLoggedIn, handleLogout, useremail }) {

    return (
        <div>
            {isLoggedIn && <div className='d-flex justify-content-between  my-1'>
                <h5>{useremail}</h5>
                <h4>WELCOME !!</h4>
                <button className="btn btn-danger w-25" onClick={handleLogout}>
                    Logout
                </button></div>}
        </div>
    )
}
