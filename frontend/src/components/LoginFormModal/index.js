import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import LoginForm from './LoginForm';
function LoginFormModal() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <span onClick={() => setShowModal(true)} style={{cursor: "pointer", height: "15px"}}>Log In</span>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <LoginForm />
        </Modal>
      )}
    </>
  );
}
export default LoginFormModal;