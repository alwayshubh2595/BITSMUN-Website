import React from 'react'
import * as yup from 'yup'
const phoneRegex = /^[0-9]{10}$/;
const EBschema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    age: yup.number().required("Age is required").positive("Enter a valid age").integer("Enter a valid age").min(15, "Age should be greater than 15"),
    phone:yup.string("Enter your phone number").matches(phoneRegex, 'Phone number is not valid').required("Phone number is required"),
    committee1: yup.string().required("Choose a committee"),
    committee2: yup.string().required("Choose a committee").notOneOf([yup.ref('committee1')], 'Choose a different committee'),
    experience: yup.string().required("Enter your experience"),
    experience: yup.string().required("Enter your experience as a member of EB"),
    
})

export default EBschema