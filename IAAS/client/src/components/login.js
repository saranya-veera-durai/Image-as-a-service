import React from 'react'

export default function Login({ useremail, password, setUseremail, setPassword, showLoginFormModal, setShowLoginFormModal, setShowSignUpFormModal, handleLogin }) {
    return (
        <div>
            {showLoginFormModal && (
                <div className="modal d-block position-fixed top-0 left-0 w-100 h-100">
                    <div className="loginmodal-content mx-auto bg-white overflow-hidden">
                        <h4 className="d-flex justify-content-between px-4 py-3 fw-bold title">
                            Login Form
                            <span className="" onClick={() => setShowLoginFormModal(false)}>
                                &times;
                            </span>
                        </h4>
                        <div className="d-flex justify-content-between mx-4 my-5">
                            <label className="">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={useremail}
                                onChange={(e) => setUseremail(e.target.value)}
                            />
                        </div>
                        <div className="d-flex justify-content-between mx-4 my-5">
                            <label className="">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="d-flex justify-content-center my-3">
                            <button
                                className="btn formbutton p-2 px-4 fw-bold w-25"
                                onClick={handleLogin}
                            >
                                Login

                            </button>
                        </div>
                        <div className="d-flex justify-content-center mb-3">
                            Don't have an account? Please &nbsp;{" "}
                            <a
                                className="text-primary"
                                onClick={() => {
                                    setShowSignUpFormModal(true);
                                    setShowLoginFormModal(false);
                                }}
                            >
                                SignUp here...{" "}
                            </a>{" "}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
