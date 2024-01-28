import React from 'react';

export default function Register({
  handleRegister,
  showSignUpFormModal,
  setShowSignUpFormModal,
  setShowLoginFormModal,
  username,
  useremail,
  password,
  confirmPassword,
  confirmPasswordError,
  setUsername,
  setUseremail,
  setPassword,
  setConfirmPassword,
}) {
  return (
    <div>
      {showSignUpFormModal && (
        <div className="modal d-block position-fixed top-0 left-0 w-100 h-100">
          <div className="modal-content mx-auto bg-white overflow-hidden">
            <h4 className="d-flex justify-content-between px-4 py-3 fw-bold title">
              Registration Form
              <span
                className=""
                onClick={() => setShowSignUpFormModal(false)}
              >
                &times;
              </span>
            </h4>
            <div className="d-flex justify-content-between mx-4 my-3 mt-5 ">
              <label className=" ">Name</label>

              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-between my-3 mx-4">
              <label className=" ">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={useremail}
                onChange={(e) => setUseremail(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-between my-3 mx-4">
              <label className=" ">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-between my-3 mx-4">
              <label className=" ">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              {" "}
              {confirmPasswordError && (
                <p className="text-danger text-center">{confirmPasswordError}</p>
              )}
            </div>
            <div className="d-flex justify-content-center my-4">
              <button
                className="btn formbutton p-2 px-4 fw-bold w-25"
                onClick={handleRegister}
              >
                Register
              </button>
            </div>
            <div className="d-flex justify-content-center mb-3">
              Already have an account? Please &nbsp;{" "}
              <a
                className="text-primary"
                onClick={() => {
                  setShowSignUpFormModal(false);
                  setShowLoginFormModal(true);
                }}
              >
                {" "}
                Login here...
              </a>{" "}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
