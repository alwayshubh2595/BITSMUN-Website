import * as yup from 'yup'
const phoneRegex = /^\d{10,15}$/;
const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Enter a valid email").required("Email is required"),
    age: yup.number().required("Age is required").positive("Enter a valid age").integer("Enter a valid age").min(13, "Age should be greater than 13"),
    phone:yup.string("Enter your phone number").matches(phoneRegex, 'Phone number is not valid').required("Phone number is required"),
    institute: yup.string().required("Institute name is required").min(3, "Enter a valid institute name"),
    countryName: yup.string().required("Country is required"),
    mode:yup.string().required("Choose a mode of participation"),
    committee1: yup.string().required("Choose a committee"),
    committee2: yup.string().required("Choose a committee").notOneOf([yup.ref('committee1')], 'Choose a different committee'),
    experience: yup.string().required("Enter your experience"),
    portfolio1: yup.string().required("Enter your first choice of Portfolio"),
    portfolio2: yup.string().required("Enter your second choice of Portfolio"),
    portfolio3: yup.string().required("Enter your third choice of Portfolio"),

})

export default schema