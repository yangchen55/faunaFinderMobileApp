import React, { useState } from 'react'
import validateEmail from '../util/validateEmail';

const useEmailValidation = () => {
    const [email, setEmail] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(true)

    const handlePassword = (passwordVar) => {
        setPassword(passwordVar)

    }

    const handleConfirmPassword = (confirmPassVar) => {
        setconfirmPassword(confirmPassVar)
    }


    const handleEmail = (emailVar) => {
        setEmailVerified(validateEmail(emailVar))
        setEmail(emailVar);


    };




    return { email, emailVerified, password, confirmPassword, showPassword, setShowPassword, setEmail, handleEmail, handlePassword, handleConfirmPassword };

}


export default useEmailValidation;